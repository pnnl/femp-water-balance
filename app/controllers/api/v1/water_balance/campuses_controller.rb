module Api
  module V1
    module WaterBalance
      class CampusesController < ModelApiController
        before_action(:authenticate_account!)

        # GET /campuses
        def index
          super
        end

        # GET /campuses/1
        def show
          super
        end

        # POST /campuses
        def create
          super
        end

        # PATCH/PUT /campuses/1
        def update
          super
        end

        # DELETE /campuses/1
        def destroy
          super
        end

        protected

        def ignored_json_params
          [:owner_id, :owner_type] + super
        end

        def create_extra_attributes
          {
              owner: current_account
          }
        end

        def active_resource
          raise(ActiveRecord::RecordNotFound, "#{params[:id]} is not a valid record ID.") unless !@resource.nil? || params[:id].to_i != 0
          @resource ||= controller_resource_class.find_by!(id: params[:id], owner: current_account)
        end

        def active_resources
          controller_resource_class.where(owner: current_account)
        end

        def controller_resource_class
          Campus
        end
      end
    end
  end
end
