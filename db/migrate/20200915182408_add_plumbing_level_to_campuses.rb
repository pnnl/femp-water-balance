class AddPlumbingLevelToCampuses < ActiveRecord::Migration[5.2]
  def change
    add_column :campuses, :plumbing_level, :string
  end
end
