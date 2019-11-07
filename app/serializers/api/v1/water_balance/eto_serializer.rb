module Api
    module V1
      module WaterBalance
        class EtoSerializer < ActiveSerializer
          attributes(Eto.column_names)
        end
      end
    end
  end