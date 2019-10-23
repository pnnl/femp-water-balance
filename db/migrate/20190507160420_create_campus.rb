class CreateCampus < ActiveRecord::Migration[5.2]
  def change
    create_table(:campuses) do |t|
      t.column(:name, :string, null: false)
      t.column(:evaluator, :string, null: true)
      t.column(:survey, :datetime, null: true)
      t.column(:year, :integer, null: true)
      t.column(:city, :string, null: true, limit: 50)
      t.column(:region, :string, null: true, limit: 50)
      t.column(:postal_code, :string, null: true, limit: 20)
      t.column(:area, :integer, null: false,  default: 0)
      t.column(:area_unit, :string, null: false, default: 'sqft')
      # number of buildings built before 1994 with no major plumbing renovations
      t.column(:legacy_building_count, :integer, null: false, default: 0)
      # number of buildings built before 1994 **with** major plumbing renovations
      t.column(:legacy_renovated_count, :integer, null: false, default: 0)
      # number of buildings built after 1994 regardless
      t.column(:modern_building_count, :integer, null: false, default: 0)
      t.references(:owner, polymorphic: true, index: true)
      t.timestamps(null: false)
    end
  end
end
