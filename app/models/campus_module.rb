class CampusModule < ApplicationRecord
  belongs_to(:campus)
  validates(:name, presence: true, uniqueness: {scope: [:campus], case_sensitive: false, message: 'has already been registered as a module for this campus'})
end
