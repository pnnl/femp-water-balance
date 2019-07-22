class AddSurveyData < ActiveRecord::Migration[5.2]
  def change
    create_table(:campus_modules) do |t|
      t.belongs_to(:campus, index: true)
      t.string(:name, null: false)
      t.json(:data, null: true, default: nil)
      t.timestamps(null: false)
    end

    add_index(:campus_modules, :name, unique: false)
    add_index(:campus_modules, [:name, :campus_id], unique: true)
  end
end
