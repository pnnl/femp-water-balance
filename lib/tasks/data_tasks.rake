require 'csv'


namespace :wb do
  namespace :data do
    desc 'Seeds database with rainfall data'
    task :rainfall => [:environment] do |task, args|
      begin
        RainFall.destroy_all
        csv_text = File.read(Rails.root.join('lib', 'seeds', 'rainfall.csv'))
        csv_data = CSV.parse(csv_text, :headers => true, :encoding => 'UTF-8')
        csv_data.each do |row|
          model = RainFall.new
          %w(zip jan_rf feb_rf mar_rf apr_rf may_rf jun_rf jul_rf aug_rf sep_rf oct_rf nov_rf dec_rf).each_with_index do |key, index|
            model[key] = row[index]
          end
          model.save
        end
        puts("System now has #{RainFall.count} rainfall data records")
      rescue Exception => e
        puts("Failed to seed database with rainfall data\n#{e}\n\t#{e.backtrace.join("\n")}")
      end
    end
    desc 'Seeds database with eto data'
    task :eto => [:environment] do
      begin
        Eto.destroy_all
        csv_data = CSV.parse(File.read(Rails.root.join('lib', 'seeds', 'eto.csv')))
        csv_data.each do |row|
          model = Eto.new
          %w(zip jan_et feb_et mar_et apr_et may_et jun_et jul_et aug_et sep_et oct_et nov_et dec_et).each_with_index do |key, index|
            model[key] = row[index]
          end
          model.save
        end
        puts("System now has #{Eto.count} rainfall data records")
      rescue Exception => e
        puts("Failed to seed database with eto data\n#{e}\n\t#{e.backtrace.join("\n")}")
      end
    end
  end
end
