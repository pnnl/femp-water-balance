Rails.application.routes.draw do
  devise_for(:accounts, controllers: { omniauth_callbacks: 'accounts/omniauth_callbacks' })
  root(to: 'water_balance/campuses#index')
  # routes that require authorization
  scope(path: 'secure') do
    scope(path: 'water-balance', module: 'water_balance', as: :water_balance) do
      resources(:campuses, only: [:index])
    end
    scope(path: 'api', module: 'api', as: :api, defaults: {format: :json}) do
      scope(path: 'v1', module: 'v1', as: :v1) do
        scope(path: 'water-balance', module: :water_balance, as: :water_balance) do
          resources(:campuses, except: [:new, :edit]) do
            resources(:campus_modules, path: 'modules', except: [:new, :edit])
          end
        end
        scope(path: 'administration', module: :admin, as: :administration) do
          resources(:accounts, except: [:new, :edit])
          resources(:campuses, except: [:new, :edit])
        end
      end
    end
  end
  # needs to be last in order to not clobber the API routes
  get('*path', to: 'water_balance/campuses#index')
end
