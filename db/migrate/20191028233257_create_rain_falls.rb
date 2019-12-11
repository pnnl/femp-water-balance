class CreateRainFalls < ActiveRecord::Migration[5.2]
  def change
    create_table :rain_falls do |t|
      t.integer :zip
      t.decimal :jan_rf
      t.decimal :feb_rf
      t.decimal :mar_rf
      t.decimal :apr_rf
      t.decimal :may_rf
      t.decimal :jun_rf
      t.decimal :jul_rf
      t.decimal :aug_rf
      t.decimal :sep_rf
      t.decimal :oct_rf
      t.decimal :nov_rf
      t.decimal :dec_rf

      t.timestamps
    end
  end
end
