require 'rails_helper'

RSpec.describe WaterBalance::CampusesController, type: :controller do

  describe "GET #index unauthorized" do
    it "responds with a 302 redirect unauthorized status" do
      expect(get(:index)).to(redirect_to(new_account_session_path))
    end
  end

  describe "GET #index" do
    login_account
    it "respond with 200 status" do
      get(:index)
      expect(response).to(have_http_status(200))
    end
  end
end
