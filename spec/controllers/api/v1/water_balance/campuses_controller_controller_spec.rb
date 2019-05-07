require 'rails_helper'
require_relative '../../../../support/json_api_shared_examples'
RSpec.describe(Api::V1::WaterBalance::CampusesController, type: :controller) do

  describe "GET #index unauthorized" do
    it "responds with a 401 unauthorized status" do
      get(:index, format: :json)
      expect(response).to(have_http_status(401))
    end
  end

  describe "GET #index" do
    login_account
    include_examples('json_api_controller', :index)

    it "loads all of the campus models" do
      FactoryBot.create_list(:campus, 5, owner: @current_account)
      get(:index, format: :json)
      expect(json.length).to eq(5)
    end
  end

  describe 'GET #show' do
    login_account

    it ('responds with a valid API response and status code and model id') do
      campus = FactoryBot.create(:campus, owner: @current_account)
      get(:show, params: {id: campus.id}, format: :json)

      expect(json['id']).to(eq(campus.id))
      expect(response.code).to (eq('200'))
      expect(response.content_type).to (eq('application/json'))
    end

    it ('responds with 404 when attempting to access unowned campus') do
      other_account = FactoryBot.create(:account)
      campus = FactoryBot.create(:campus, owner: other_account)
      get(:show, params: {id: campus.id}, format: :json)
      expect(response.code).to (eq('404'))
      expect(response.content_type).to (eq('application/json'))
    end

  end

  describe 'DELETE #destroy' do
    login_account

    it ('responds with a valid API response and status code') do
      campus = FactoryBot.create(:campus, owner: @current_account)
      # delete the campus
      delete(:destroy, params: {id: campus.id}, format: :json)
      expect(response.code).to (eq('200'))
      expect(response.content_type).to (eq('application/json'))

      # make sure we still can't get it
      get(:show, params: {id: campus.id}, format: :json)
      expect(response.code).to (eq('404'))
    end

    it ('responds with 404 when attempting to remove unowned campus') do
      other_account = FactoryBot.create(:account)
      campus = FactoryBot.create(:campus, owner: other_account)
      delete(:destroy, params: {id: campus.id}, format: :json)
      expect(response.code).to (eq('404'))
      expect(response.content_type).to (eq('application/json'))
    end

  end

  describe 'PUT/PATCH #update' do
    login_account

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

    it ('responds with 404 when attempting to remove unowned campus') do
      other_account = FactoryBot.create(:account)
      campus = FactoryBot.create(:campus, owner: other_account)
      # JSON API format https://jsonapi.org/
      json_data = {
          data: {
              attributes: {
                  name: 'Winterfell'
              }
          }
      }
      put(:update, params: { id: campus.id }.merge(json_data), format: :json)
      expect(response.code).to (eq('404'))
      expect(response.content_type).to (eq('application/json'))
    end

  end
end
