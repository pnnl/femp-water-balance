# Abstract base API controller for standard active record models.
#
module Api
  class ModelApiController < BaseController
    abstract!
    helper_method :active_resource

    def index
      render(json: query_model, include: json_api_include, fields: json_api_sparse_fieldset, meta: meta_attributes(query_model, {}))
    end

    def create
      @resource = controller_resource_class.create(create_extra_attributes.merge(json_params(controller_resource_class)))
      if @resource.persisted?
        render(json: @resource, include: json_api_include, meta: meta_attributes(query_model, {}))
      else
        handle_api_model_failure(@resource)
      end
    end

    def show
      render(json: active_resource, include: json_api_include, fields: json_api_sparse_fieldset, meta: meta_attributes(query_model, {}))
    end

    def update
      if active_resource.update(json_params(controller_resource_class))
        render(json: active_resource, include: json_api_include, fields: json_api_sparse_fieldset, meta: meta_attributes(query_model, {}))
      else
        handle_api_model_failure(active_resource)
      end
    end

    def destroy
      if active_resource.destroy
        render(json: active_resource, include: json_api_include, fields: json_api_sparse_fieldset, meta: meta_attributes(query_model, {}))
      else
        handle_api_model_failure(active_resource)
      end
    end

    protected

    def active_resource
      raise(ActiveRecord::RecordNotFound, "#{params[:id]} is not a valid record ID.") unless !@resource.nil? || params[:id].is_i?
      @resource ||= controller_resource_class.find_by!(id: params[:id])
    end

    def create_extra_attributes
      {}
    end

    def active_resources
      controller_resource_class.where(nil)
    end

    def json_api_include
      inclusion = []
      (params.fetch(:include, '*') || '').gsub(/\*\*/, '*').split(',').each do |attribute|
        return attribute if '*'.eql?(attribute)

        normalized_attribute = attribute.gsub(/-/, '_').to_sym
        unless controller_resource_class.reflect_on_association(normalized_attribute).nil?
          # this attribute is an association
          inclusion << normalized_attribute
        end
      end
      Rails.logger.debug("#{request.path}:json_api_include:'#{inclusion}'")
      inclusion.empty? ? nil : inclusion
    end

    def json_api_sparse_fieldset
      field_set = {}
      fields_param = params.fetch('fields', {})
      resource_relationships.each do |relationship|
        user_fields = (fields_param[relationship.to_s] || '').split(',')
        next if user_fields.empty?
        field_set[relationship.to_sym] = user_fields.map(&:to_s)
      end

      resource_type = controller_resource_class.name.pluralize.underscore.downcase.gsub(/_/, '-')
      (fields_param[resource_type] || '').split(',').each do |attribute|
        normalized_attribute = attribute.gsub(/-/, '_')
        field_set[resource_type.to_sym] = field_set[resource_type.to_sym].nil? ? [] : field_set[resource_type.to_sym]
        field_set[resource_type.to_sym] << normalized_attribute
      end
      Rails.logger.debug("#{request.path}:json_api_sparse_fieldset:'#{field_set}'")
      field_set.empty? ? nil : field_set
    end

    def json_api_sorting
      sort_value = params.fetch(:sort, '')
      clause = {}
      sort_value.split(',').each do |user_attribute|
        column_name = (user_attribute.start_with?('-') ? user_attribute.slice(1, user_attribute.length) : user_attribute).gsub(/-/, '_')
        if controller_resource_class.column_names.include?(column_name)
          clause[column_name.to_sym] = user_attribute.start_with?('-') ? :desc : :asc
        end
      end
      Rails.logger.debug("#{request.path}:json_api_sorting:'#{clause.to_json}'")
      clause
    end

    def query_model
      model_query = active_resources.order(json_api_sorting)
      model_query = query_by_example(model_query)

      inclusions = json_api_include
      if inclusions.is_a?(String)
        # if the inclusions is a string it's '*' so we want include everything
        model_query = model_query.includes(resource_relationships)
      else
        # otherwise include specific relations
        model_query = model_query.includes(inclusions)
      end
      paginate_results(model_query)
    end

    def query_by_example(relation)
      query_params = query_param
      unless query_params.nil? || !query_params.is_a?(Hash)
        return relation if query_params.empty?
        Rails.logger.debug("#{request.path}:query_by_example:'#{query_params}'")
        # convert any dashes to underscores
        clazz = controller_resource_class
        query_params.keys.each do |k|
          column_name = k.to_s.gsub('-','_')
          ar_column = clazz.columns_hash[column_name]
          unless ar_column.nil?
            query_params[column_name] = ar_column.type_cast_from_user(query_params[k])
          end
        end
        # intersection of parameters to what are actually valid column names
        valid_parameters = controller_resource_class.column_names & query_params.keys.map(&:to_s)
        Rails.logger.debug("#{request.path}:query_by_example:valid:'#{valid_parameters}'")
        where_clause = query_params.delete_if { |k| !valid_parameters.include?(k) }
        Rails.logger.debug("#{request.path}:query_by_example:where:'#{where_clause}'")
        return relation.where(where_clause)
      end
      relation
    end

    def paginate_results(activerecord)
      if paginate?
        Rails.logger.debug("#{request.path}:paginate_results:('#{page_param}','#{page_size_param}')")
        return activerecord.page(page_param).per(page_size_param)
      end
      activerecord
    end

    def resource_relationships
      controller_resource_class.reflect_on_all_associations.select do |association|
        [:belongs_to, :has_many, :has_one].include?(association.macro)
      end.map(&:name)
    end

    def meta_attributes(collection, extra_meta = {})
      extra_meta[:flash] = {}
      [:info, :warn, :error].each do |key|
        extra_meta[:flash][key] = flash[key] unless flash[key].nil? || flash[key].empty?
      end
      extra_meta.delete(:flash) if extra_meta[:flash].empty?
      if paginate?
        return {
            current_page: collection.current_page,
            next_page: collection.next_page,
            prev_page: collection.prev_page,
            total_pages: collection.total_pages,
            total_count: collection.total_count
        }.merge(extra_meta)
      end
      extra_meta
    end

    def controller_resource_class
      raise(StandardError, 'Please implement controller_resource_class method.')
    end
  end
end
