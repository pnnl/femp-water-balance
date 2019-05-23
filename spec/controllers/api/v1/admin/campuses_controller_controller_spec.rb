require 'rails_helper'
require_relative '../../../../support/json_api_shared_examples'
RSpec.describe(Api::V1::Admin::CampusesController, type: :controller) do

  describe "GET #index unauthorized" do
    it "responds with a 401 unauthorized status" do
      get(:index, format: :json)

      expect(response).to(have_http_status(401))
    end
  end

  describe "GET #index with a non-administrative account " do
    login_account
    it "responds with a 404 unauthorized status" do
      get(:index, format: :json)

      expect(response).to(have_http_status(404))
    end
  end

  describe "GET #index" do
    login_administrator
    include_examples('json_api_controller', :index)

    it "loads all of the campus models" do
      other_account = FactoryBot.create(:account)
      FactoryBot.create_list(:campus, 5, owner: @current_account)
      FactoryBot.create_list(:campus, 5, owner: other_account)
      get(:index, format: :json)

      expect(json.length).to eq(10)
    end
  end

  describe 'GET #show' do
    login_administrator
    it ('responds with a valid API response and status code and model id') do
      campus = FactoryBot.create(:campus, owner: @current_account)
      get(:show, params: {id: campus.id}, format: :json)

      expect(json['id']).to(eq(campus.id))
      expect(response.code).to (eq('200'))
      expect(response.content_type).to (eq('application/json'))
    end
  end

  describe 'DELETE #destroy' do
    login_administrator
    it ('Removes campus records owned by current_account properly') do
      campus = FactoryBot.create(:campus, owner: @current_account)
      # delete the campus
      delete(:destroy, params: {id: campus.id}, format: :json)
      expect(response.code).to (eq('200'))
      expect(json['id']).to(eq(campus.id))
      expect(response.content_type).to (eq('application/json'))
    end
  end

  describe 'PUT/PATCH #update' do
    login_administrator

    it ('responds with a valid API response and status code') do
      campus = FactoryBot.create(:campus, owner: @current_account)
      # JSON API format https://jsonapi.org/
      json_data = {
          data: {
              attributes: {
                  name: 'Winterfell'
              }
          }
      }
      put(:update, params: { id: campus.id }.merge(json_data), format: :json)
      expect(response.code).to (eq('200'))
      expect(response.content_type).to (eq('application/json'))

      # make sure we still can't get it
      get(:show, params: { id: campus.id }, format: :json)
      expect(response.code).to (eq('200'))
      expect(json['name']).to eq('Winterfell')
    end
  end
end
