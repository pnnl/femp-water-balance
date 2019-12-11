require 'rails_helper'
require_relative '../../../../support/json_api_shared_examples'
RSpec.describe(Api::V1::Admin::AccountsController, type: :controller) do

  describe "GET #index unauthorized" do
    it "responds with a 401 unauthorized status" do
      get(:index, format: :json)
      expect(response).to(have_http_status(401))
    end
  end
  describe "GET #index with non-administrative account" do
    login_account
    it "loads all of the account models" do
      get(:index, format: :json)
      expect(response).to(have_http_status(404))
    end
  end

  describe "GET #index" do
    login_administrator
    include_examples('json_api_controller', :index)
    it "loads all of the account models" do
      FactoryBot.create_list(:account, 5)
      get(:index, format: :json)
      # +1 for current_account
      expect(json.length).to eq(6)
    end
  end

  describe 'GET #show' do
    login_administrator
    it ('responds with a valid API response and status code and model id') do
      account = FactoryBot.create(:account)
      get(:show, params: {id: account.id}, format: :json)
      expect(json['id']).to(eq(account.id))
      expect(response.code).to (eq('200'))
      expect(response.content_type).to (eq('application/json'))
    end

  end

  describe 'DELETE #destroy' do
    login_administrator
    it ('Removes account records owned by current_account properly') do
      account = FactoryBot.create(:account)
      # delete the account
      delete(:destroy, params: {id: account.id}, format: :json)
      expect(response.code).to (eq('200'))
      expect(json['id']).to(eq(account.id))
      expect(response.content_type).to (eq('application/json'))
    end

    it ('responds with 404 when attempting to remove unknown account') do
      delete(:destroy, params: {id: 0}, format: :json)
      expect(response.code).to (eq('404'))
      expect(response.content_type).to (eq('application/json'))
    end
  end

  describe 'PUT/PATCH #update' do
    login_administrator

    it ('responds with a valid API response and status code') do
      account = FactoryBot.create(:account)
      # JSON API format https://jsonapi.org/
      json_data = {
          data: {
              attributes: {
                  email: 'ned-stark@kings-landing.org'
              }
          }
      }
      put(:update, params: { id: account.id }.merge(json_data), format: :json)
      expect(response.code).to (eq('200'))
      expect(response.content_type).to (eq('application/json'))

      # make sure we still can't get it
      get(:show, params: { id: account.id }, format: :json)
      expect(response.code).to (eq('200'))
      expect(json['email']).to eq('ned-stark@kings-landing.org')
    end
  end
end
