module Api
  class BaseController < ApplicationController
    protect_from_forgery(with: :null_session)
    respond_to(:json)
    rescue_from(Exception, with: :handle_api_exception)
    rescue_from(ActiveRecord::RecordNotFound, with: :api_not_found)
    rescue_from(ActionController::RoutingError, with: :api_not_found)
    before_action(:ensure_json_request)
    abstract!

    protected

    def ensure_json_request
      return if params[:format] == "json" || request.headers["Accept"] =~ /json/
      head(:not_acceptable)
    end

    # pass in a model class to ensure that all attributes in the returned hash are valid for the model.
    def json_params(model = nil)
      # we ignore ID, Created At, Updated At as they are set by the server side. Clients should not dictate these.
      json_parameters = ActiveModelSerializers::Deserialization.jsonapi_parse(params, except: ignored_json_params)
      if !model.nil? && model.respond_to?(:column_names)
        json_parameters = json_parameters.delete_if do |key, value|
          if key.to_s.ends_with?('_attributes')
            nested_attributes = /^(.*)_attributes$/.match(key.to_s)[1]
            delete = model.nested_attributes_options[nested_attributes.to_sym].nil?
          else
            delete = !model.column_names.include?(key.to_s)
          end
          delete
        end
      end
      Rails.logger.debug("#{request.path}::#{request.method}:json_params:'#{json_parameters}'")
      json_parameters
    end

    def handle_api_model_failure(model)
      if model.nil? || !model.respond_to?(:errors)
        Rails.logger.warn("#handle_api_model_failure for nil model for method:#{request.method}:#{request.path}::#{request.method}")
      else
        Rails.logger.warn("#{model.class.name} failed for method:#{request.method}:#{request.path}::#{request.method} due to errors {#{model.errors.full_messages.join(' | ')}}")
        render(json: model, adapter: :json_api, serializer: ActiveModel::Serializer::ErrorSerializer, status: 400)
      end
    end

    def api_not_found
      error_obj = {
          status: '404',
          source: {
              pointer: request.path
          },
          title: 'Resource not found',
          detail: 'Resource at the given source is invalid'
      }
      render(json: {errors: [error_obj]}, status: 404)
    end

    def query_param
      params.fetch(:q, {}).permit!
    end

    def page_param
      page_parameter = params.fetch(:page, {number: 1})
      page_number = 1
      if page_parameter.is_a?(Hash)
        page_number = ActiveRecord::Type::Integer.new.type_cast_from_user((page_parameter['number'] || '1'))
      elsif page_parameter.is_a?(String)
        page_number = ActiveRecord::Type::Integer.new.type_cast_from_user((page_parameter || '1'))
      end
      [1, page_number].max
    end

    def page_size_param
      page_parameter = params.fetch(:page, {size: 25})
      if page_parameter.is_a?(Hash)
        page_size = ActiveRecord::Type::Integer.new.type_cast_from_user((page_parameter['size'] || '25'))
      else
        page_parameter = params.fetch(:size, 25)
        page_size = ActiveRecord::Type::Integer.new.type_cast_from_user(page_parameter)
      end
      [1, page_size].max
    end

    def paginate?
      !params[:page].blank?
    end

    def ignored_json_params
      [:created_at, :updated_at, :id]
    end

    def handle_api_exception(exception)
      Rails.logger.fatal("Handling API Exception:#{exception}\n#{exception.backtrace.join("\n")}")
      # ExceptionNotifier.notify_exception(exception, env: request.env) unless Rails.env.development?
      error_obj = {
          status: '500',
          source: {pointer: request.path},
          title: exception.class.to_s,
          detail: exception.to_s
      }
      error_obj[:backtrace] = exception.backtrace.take(10) unless Rails.env.production?
      render(json: {errors: [error_obj]}, status: 500)
    end

    def require_administrator!
      raise(ActiveRecord::RecordNotFound) unless !current_account.nil? && current_account.role_implied?(:administrator)
    end
  end
end
