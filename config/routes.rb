Rails.application.routes.draw do
  devise_for(:accounts)

  root(to: redirect('/secure/water-balance/campuses'))
  # routes that require authorization
  scope(path: 'secure') do
    scope(path: 'water-balance', module: 'water_balance', as: :water_balance) do
      resources(:campuses, only: [:index])
    end
    scope(path: 'api', module: 'api', as: :api, defaults: {format: :json}) do
      scope(path: 'v1', module: 'v1', as: :v1) do
        scope(path: 'water-balance', module: :water_balance, as: :water_balance) do
          resources(:campuses, except: [:new, :edit])
        end
      end
    end
  end
end
