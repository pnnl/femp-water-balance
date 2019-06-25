class Accounts::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def google_oauth2
    @account = Account.from_omniauth(request.env['omniauth.auth'])
    if @account.persisted?
      # Removing extra as it can overflow some session stores
      flash[:notice] = I18n.t 'devise.omniauth_callbacks.success', kind: 'Google'
      sign_in_and_redirect @account, event: :authentication
    else
      session['devise.oauth_meta'] = request.env['omniauth.auth'].except(:extra)
      redirect_to new_user_registration_url, alert: @account.errors.full_messages.join("\n")
    end
  end
end
