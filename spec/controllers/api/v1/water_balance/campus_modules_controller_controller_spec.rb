require 'rails_helper'
RSpec.describe(Api::V1::WaterBalance::CampusModulesController, type: :controller) do

  describe "GET #index unauthorized" do
    it "responds with a 401 unauthorized status" do
      current_account = FactoryBot.create(:account)
      campus = FactoryBot.create(:campus, owner: current_account)
      get(:index, params: { campus_id: campus.id }, format: :json)
      expect(response).to(have_http_status(401))
    end
  end

  describe "GET #index" do
    login_account

    it "loads all of the campus modules" do
      campus = FactoryBot.create(:campus, owner: @current_account)
      FactoryBot.create_list(:campus_module, 5, campus: campus, campus_id: campus.id)
      get(:index, params: {campus_id: campus.id}, format: :json)
      expect(json.length).to eq(5)
    end
  end

  describe 'GET #show' do
    login_account

    it ('responds with a valid API response and status code and model id') do
      campus = FactoryBot.create(:campus, owner: @current_account)
      campus_module = FactoryBot.create(:campus_module, name: 'kitchen', campus: campus, data: {attr_1: 'foo'})
      get(:show, params: {campus_id: campus.id, id: campus_module.id}, format: :json)

      expect(response.code).to (eq('200'))
      expect(response.content_type).to (eq('application/json'))

      expect(json['id']).to(eq(campus_module.id))
      expect(json['data']).to(eq(campus_module.data))
      expect(json['name']).to(eq(campus_module.name))
    end

    it ('responds with 404 when attempting to access unowned campus') do
      other_account = FactoryBot.create(:account)
      campus = FactoryBot.create(:campus, owner: other_account)
      campus_module = FactoryBot.create(:campus_module, campus: campus)

      get(:show, params: {campus_id: campus.id, id: campus_module.id}, format: :json)
      expect(response.code).to (eq('404'))
      expect(response.content_type).to (eq('application/json'))
    end

  end

  describe 'POST #create' do
    login_account

    it ('responds correctly when duplicate module is attempted to be created') do
      campus = FactoryBot.create(:campus, owner: @current_account)
      FactoryBot.create(:campus_module, name: 'Saturn', campus: campus)
      # JSON API format https://jsonapi.org/
      json_data = {
          data: {
              attributes: {
                  name: 'saturn',
                  data: {
                      a: 'foo',
                      b: 'bar',
                      c: 'baz'
                  }
              }
          }
      }
      # case-insensitive so Saturn and saturn are the same
      post(:create, params: {campus_id: campus.id}.merge(json_data), format: :json)
      expect(response.code).to (eq('400'))
      expect(response.content_type).to (eq('application/json'))
    end

    it ('responds with a valid API response and status code and model id') do
      campus = FactoryBot.create(:campus, owner: @current_account)
      # JSON API format https://jsonapi.org/
      json_data = {
          data: {
              attributes: {
                  name: 'kitchen',
                  data: {
                      a: 'foo',
                      b: 'bar',
                      c: 'baz'
                  }
              }
          }
      }

      post(:create, params: {campus_id: campus.id}.merge(json_data), format: :json)

      expect(response.code).to (eq('200'))
      expect(response.content_type).to (eq('application/json'))

      # our original json_data obj has symbols for keys and the JSON format has string keys
      expect(json['data'].deep_symbolize_keys).to(eq(json_data[:data][:attributes][:data]))
      expect(json['name']).to(eq(json_data[:data][:attributes][:name]))
    end

    it ('responds with 404 when attempting to access unowned campus') do
      other_account = FactoryBot.create(:account)
      campus = FactoryBot.create(:campus, owner: other_account)
      # JSON API format https://jsonapi.org/
      json_data = {
          data: {
              attributes: {
                  name: 'kitchen',
                  data: {
                      A: 'foo',
                      B: 'bar'
                  }
              }
          }
      }
      post(:create, params: {campus_id: campus.id}.merge(json_data), format: :json)
      expect(response.code).to (eq('404'))
      expect(response.content_type).to (eq('application/json'))
    end

  end

  describe 'DELETE #destroy' do
    login_account

    it ('Removes campus records owned by current_account properly') do
      campus = FactoryBot.create(:campus, owner: @current_account)
      campus_module = FactoryBot.create(:campus_module, campus: campus)
      # delete the campus
      delete(:destroy, params: {campus_id: campus.id, id: campus_module.id}, format: :json)

      expect(json['id']).to(eq(campus_module.id))
      expect(response.code).to (eq('200'))
      expect(response.content_type).to (eq('application/json'))
    end

    it ('responds with 404 when attempting to remove unowned campus') do
      other_account = FactoryBot.create(:account)
      campus = FactoryBot.create(:campus, owner: other_account)
      campus_module = FactoryBot.create(:campus_module, campus: campus)

      delete(:destroy, params: {campus_id: campus.id, id: campus_module.id}, format: :json)
      expect(response.code).to (eq('404'))
      expect(response.content_type).to (eq('application/json'))
    end

  end

  describe 'PUT/PATCH #update' do
    login_account

    it ('responds with a valid API response and status code') do
      campus = FactoryBot.create(:campus, owner: @current_account)
      campus_module = FactoryBot.create(:campus_module, campus: campus)
      # JSON API format https://jsonapi.org/
      json_data = {
          data: {
              attributes: {
                  name: 'kitchen',
                  data: {
                      foo: 'bar',
                      bah: 1,
                  }
              }
          }
      }
      put(:update, params: {campus_id: campus.id, id: campus_module.id}.merge(json_data), format: :json)
      expect(response.code).to (eq('200'))
      expect(response.content_type).to (eq('application/json'))

      # make sure we still can't get it
      get(:show, params: {campus_id: campus.id, id: campus_module.id}, format: :json)
      expect(response.code).to (eq('200'))
      expect(json['name']).to eq('kitchen')
      expect(json['data']['foo']).to eq('bar')
      expect(json['data']['bah']).to eq('1')
    end

    it ('responds with 404 when attempting to remove unowned campus') do
      other_account = FactoryBot.create(:account)
      campus = FactoryBot.create(:campus, owner: other_account)
      campus_module = FactoryBot.create(:campus_module, campus: campus)
      # JSON API format https://jsonapi.org/
      json_data = {
          data: {
              attributes: {
                  data: {
                      foo: 'baz',
                      bah: 12,
                  }
              }
          }
      }
      put(:update, params: {campus_id: campus.id, id: campus_module.id}.merge(json_data), format: :json)
      expect(response.code).to (eq('404'))
      expect(response.content_type).to (eq('application/json'))
    end
  end
end
