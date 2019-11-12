class CreateEtos < ActiveRecord::Migration[5.2]
  def change
    create_table :etos do |t|
      t.integer :zip
      t.decimal :jan_et
      t.decimal :feb_et
      t.decimal :mar_et
      t.decimal :apr_et
      t.decimal :may_et
      t.decimal :jun_et
      t.decimal :jul_et
      t.decimal :aug_et
      t.decimal :sep_et
      t.decimal :oct_et
      t.decimal :nov_et
      t.decimal :dec_et

      t.timestamps
    end
  end
end
