module WaterBalance
  class BaseController < ApplicationController
    abstract!
    before_action(:authenticate_account!)
  end
end
