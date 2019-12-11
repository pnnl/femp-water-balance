class Campus < ApplicationRecord
  belongs_to(:owner, polymorphic: true)
  has_many(:campus_modules, inverse_of: :campus, dependent: :destroy)
end
