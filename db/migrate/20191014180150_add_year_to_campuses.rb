class AddYearToCampuses < ActiveRecord::Migration[5.2]
  def change
    add_column :campuses, :year, :integer
  end
end