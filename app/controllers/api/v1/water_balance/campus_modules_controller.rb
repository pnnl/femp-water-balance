module Api
  module V1
    module WaterBalance
      class CampusModulesController < ModelApiController
        before_action(:authenticate_account!)

        # GET /campuses/:campus_id/modules
        def index
          super
        end

        # GET /campuses/:campus_id/modules/:id
        def show
          super
        end

        # POST /campuses/:campus_id/modules
        def create
          super
        end

        # PATCH/PUT /campuses/:campus_id/modules/:id
        def update
          super
        end

        # DELETE /campuses/:campus_id/modules/:id
        def destroy
          super
        end

        protected

        def create_extra_attributes
          {
              campus: active_campus,
              campus_id: active_campus.id
          }
        end

        def active_resource
          raise(ActiveRecord::RecordNotFound, "#{params[:id]} is not a valid campus module ID.") unless !@resource.nil? || params[:id].to_i != 0
          @resource ||= controller_resource_class.find_by!(id: params[:id], campus: active_campus)
        end

        def active_campus
          @active_campus = Campus.find_by!(id: params[:campus_id].to_i, owner: current_account)
        end

        def active_resources
          controller_resource_class.where(campus_id: params[:campus_id].to_i)
        end

        def controller_resource_class
          CampusModule
        end
      end
    end
  end
end
