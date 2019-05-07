class Campus < ApplicationRecord
  belongs_to(:owner, polymorphic: true)
end
