module Api
    module V1
      module WaterBalance
        class RainFallSerializer < ActiveSerializer
          attributes(RainFall.column_names)
        end
      end
    end
  end