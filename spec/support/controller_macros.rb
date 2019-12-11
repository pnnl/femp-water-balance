module ControllerMacros
  include Warden::Test::Helpers
  def login_account
    before(:each) do
      @request.env["devise.mapping"] = Devise.mappings[:account]
      @current_account = FactoryBot.create(:account)
      sign_in @current_account
    end
  end

  def login_administrator
    before(:each) do
      @request.env["devise.mapping"] = Devise.mappings[:account]
      @current_account = FactoryBot.create(:administrator)
      sign_in @current_account
    end
  end
end
