module Api
  module V1
    module Admin
      class CampusesController < ModelApiController
        before_action(:authenticate_account!, :require_administrator!)

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

        def controller_resource_class
          Campus
        end
      end
    end
  end
end
