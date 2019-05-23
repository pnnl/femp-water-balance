module Api
  module V1
    module Admin
      class AccountsController < ModelApiController
        before_action(:authenticate_account!, :require_administrator!)

        # GET /accounts
        def index
          super
        end

        # GET /accounts/1
        def show
          super
        end

        # POST /accounts
        def create
          super
        end

        # PATCH/PUT /accounts/1
        def update
          super
        end

        # DELETE /accounts/1
        def destroy
          super
        end

        protected

        def controller_resource_class
          Account
        end
      end
    end
  end
end
