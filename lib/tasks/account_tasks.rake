namespace :wb do
  namespace :account do
    desc 'Quickly create new accounts in the current environment for testing and development.'
    task :create, [:email, :password, :roles] => [:environment] do |task, args|
      begin
        account = Account.create(email: args[:email], password: (args[:password] || 'password'), password_confirmation: (args[:password] || 'password'))
        args[:roles].split(',').each { | role_name | account.account_roles.create(role: role_name.to_sym) } if args[:roles]

      rescue Exception => e
        puts("Failed to create a new Account model\n#{e}\n\t#{e.backtrace.join("\n")}")
      end
    end
    desc 'Clear all passwords in the current environment for testing and development.'
    task :reset => [:environment] do
      begin
        Account.all.each do |account|
          account.password = 'password'
          account.password_confirmation = 'password'
          account.save
        end
      rescue Exception => e
        puts("Failed to reset passwords for the accounts model\n#{e}\n\t#{e.backtrace.join("\n")}")
      end
    end
  end
end
