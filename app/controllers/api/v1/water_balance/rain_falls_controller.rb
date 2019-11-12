module Api
    module V1
      module WaterBalance
        class RainFallsController < ModelApiController
          before_action(:authenticate_account!)

          # GET /rainfall/1
          def show
            super
          end

          def active_resource
            @resource = controller_resource_class.find_by!(zip: params[:zip])
          end

          def controller_resource_class
            RainFall
          end
        end
      end
    end
  end