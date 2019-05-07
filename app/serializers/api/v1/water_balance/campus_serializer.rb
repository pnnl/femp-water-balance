#
module Api
  module V1
    module WaterBalance
      class CampusSerializer < ActiveModel::Serializer
        attributes(%w(id name))
      end
    end
  end
end
