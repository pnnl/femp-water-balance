RSpec.shared_examples "json_api_controller" do | parameter |

  it 'responds unacceptable for non-JSON request with HTTP 406 status code"' do
    get(parameter.to_sym)
    expect(response).to(have_http_status(406))
  end

  it 'responds successfully with an HTTP 200 status code and content-type' do
    get(parameter.to_sym, format: :json)
    expect(response).to(have_http_status(200))
    expect(response.content_type).to eq('application/json')
  end
end
