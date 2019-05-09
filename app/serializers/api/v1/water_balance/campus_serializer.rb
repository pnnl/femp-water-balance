#
module Api
  module V1
    module WaterBalance
      class CampusSerializer < ActiveSerializer
        attributes(Campus.column_names)
      end
    end
  end
end
