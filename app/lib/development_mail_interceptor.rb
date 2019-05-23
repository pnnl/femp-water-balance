class DevelopmentMailInterceptor
  def self.delivering_email(message)
    unless %w{AssetScore.SystemFailureNotification@pnnl.gov}.include?(message.to)
      message.subject = "#{message.subject} [#{message.to}]"
      message.to = 'AssetScore.DummyAddress@pnnl.gov'
    end
    message.bcc = nil
  end
end
