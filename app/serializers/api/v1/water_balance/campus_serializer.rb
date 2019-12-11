#
module Api
  module V1
    module WaterBalance
      class CampusSerializer < ActiveSerializer
        attributes(Campus.column_names)
        attributes(:modules)
        def modules
          CampusModule.where(campus_id: object.id).map { |cm| [cm.id, cm.name]}.to_h
        end
      end
    end
  end
end
