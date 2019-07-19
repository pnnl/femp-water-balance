#
module Api
  module V1
    module WaterBalance
      class CampusModuleSerializer < ActiveSerializer
        attributes(CampusModule.column_names)
      end
    end
  end
end
