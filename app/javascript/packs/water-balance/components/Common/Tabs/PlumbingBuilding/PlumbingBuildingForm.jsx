import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Form, Field} from 'react-final-form';
import {Select} from 'final-form-material-ui';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MaterialInput from '../../MaterialInput';
import {FieldArray} from 'react-final-form-arrays';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import arrayMutators from 'final-form-arrays';
import selectn from 'selectn';
import createDecorator from 'final-form-focus';
import {submitAlert, FormRulesListener, toNumber} from '../shared/sharedFunctions';
import {fabStyle, DEFAULT_DECIMAL_MASK, mediaQuery, expansionDetails, numberFormat} from '../shared/sharedStyles';
import formValidation from './PlumbingBuildingForm.validation';
import validate from '../Occupancy/OccupancyForm.validation';
import {buildingTypeMap} from '../shared/sharedConstants';
import WarningIcon from '@material-ui/icons/Warning';
import Handbook from '../shared/handbookLink';

import {Fab, Grid, Button, InputAdornment, MenuItem} from '@material-ui/core';

let expansionPanel = mediaQuery();

const focusOnError = createDecorator();

const assumedTypes = ['hotel', 'barracks', 'family'];
const hospitalTypes = ['admin', 'healthWorker', 'outpatient', 'inpatient'];
const assumedUrinalFlushesPerPersonPerHour = 0.25;
const assumedDaysPerYear = 350;
const assumedUrinalFlushRate = 0.125;
const assumedFlushRate = 0.375;
const assumedShowerPercent = 0.69;
const restroomSinkUseMap = {
  hotel: 0.25,
  barracks: 0.25,
  family: 0.25,
  hospital: 0.125,
  clinic: 1.05,
  other: 0.125
};

const kitchenSinkUseMap = {
  hotel: 0.5,
  barracks: 0.5,
  family: 2.5,
  hospital: 0.5,
  clinic: 0.5,
  other: 0.5
};

class PlumbingForm extends React.Component {
  constructor(props) {
    super(props);
    let waterUse = selectn(`campus.modules.plumbing.plumbing.water_usage`)(props);
    this.state = {
      waterUse: waterUse ? ' Water Use: ' + waterUse + ' kgal' : ''
    };
    this.calculateWaterUse = this.calculateWaterUse.bind(this);
  }

  occupantsPerDay = audit => {
    const week_day_occupancy = toNumber(audit.weekday_occupancy);
    const weekend_occupancy = toNumber(audit.weekend_occupancy);
    let weekdays = week_day_occupancy ? 5 : 0;
    let weekendDays = weekend_occupancy ? 2 : 0;
    let totalDays = weekdays + weekendDays;
    return (week_day_occupancy * 5 + weekend_occupancy * 2) / totalDays;
  };

  daysPerYear = (audit, buildingType) => {
    const week_days_year = toNumber(audit.week_days_year);
    const weekend_days_year = toNumber(audit.weekend_days_year);

    let daysPerYear;
    if (assumedTypes.indexOf(buildingType) > -1) {
      daysPerYear = assumedDaysPerYear;
    } else {
      daysPerYear = week_days_year + weekend_days_year;
    }
    return daysPerYear;
  };

  getOccupancy = (audit, buildingType, isTransient) => {
    // Occupants per day
    let occupantsPerDay = this.occupantsPerDay(audit);

    // Hours per day
    const week_days_year = toNumber(audit.week_days_year);
    const week_days_hours = toNumber(audit.week_days_hours);
    const weekend_days_year = toNumber(audit.weekend_days_year);
    const weekend_days_hours = toNumber(audit.weekend_days_hours);
    let hoursPerDay;
    if (assumedTypes.indexOf(buildingType) > -1) {
      hoursPerDay = 8;
    } else {
      hoursPerDay = (week_days_hours * week_days_year + weekend_days_hours * weekend_days_year) / (week_days_year + weekend_days_year);
    }

    // Days per year
    let daysPerYear = this.daysPerYear(audit, buildingType);

    if (isTransient) {
      daysPerYear = daysPerYear / hoursPerDay;
    }

    return {daysPerYear, totalHoursOccupiedPerYear: occupantsPerDay * hoursPerDay * daysPerYear};
  };

  calculateUrinals = (fixture, buildingType, audit, totalHoursOccupiedPerYear) => {
    if (buildingType === 'family') {
      return 0;
    }
    if (fixture.urinals === 'no') {
      return 0;
    }
    const percentMale = toNumber(audit.percent_male) / 100;
    const flushRate = toNumber(fixture.urinal_flush_rate);
    const totalFlushes = percentMale * assumedUrinalFlushesPerPersonPerHour * totalHoursOccupiedPerYear;
    return (totalFlushes * flushRate) / 1000;
  };

  calculateToilets = (fixture, audit, totalHoursOccupiedPerYear) => {
    const averageFlushRate = toNumber(fixture.typical_flush_rate);
    const percentMale = toNumber(audit.percent_male) / 100;
    const femaleFlushes = assumedFlushRate;
    let maleFlushes = assumedFlushRate;
    if (fixture.urinals === 'yes') {
      maleFlushes = assumedUrinalFlushRate;
    }
    const maleFlushesPerYear = percentMale * maleFlushes * totalHoursOccupiedPerYear;
    const femaleFlushesPerYear = (1 - percentMale) * femaleFlushes * totalHoursOccupiedPerYear;

    return ((maleFlushesPerYear + femaleFlushesPerYear) * averageFlushRate) / 1000;
  };

  calculateRestroomSink = (fixture, buildingType, totalHoursOccupiedPerYear) => {
    const aeratorFlowRate = toNumber(fixture.aerator_flow_rate);
    const minutesUsedPerHour = restroomSinkUseMap[buildingType];
    const totalMinutesPerYear = minutesUsedPerHour * totalHoursOccupiedPerYear;

    return (aeratorFlowRate * totalMinutesPerYear) / 1000;
  };

  calculateKitchenSink = (fixture, audit, primaryBuildingType, daysPerYear) => {
    const minutesUsedPerOccupant = kitchenSinkUseMap[primaryBuildingType];
    const averageFlowRate = toNumber(fixture.kitchenette_flow_rate);
    const minutesUsedPerYear = this.occupantsPerDay(audit) * daysPerYear * minutesUsedPerOccupant;

    return (averageFlowRate * minutesUsedPerYear) / 1000;
  };

  calculateShowers = (fixture, audit, primaryBuildingType, daysPerYear) => {
    const averageShowerFlowRate = toNumber(fixture.shower_flow_rate);
    let occupantShowerPercent;
    let minutesPerShower;
    if (assumedTypes.indexOf(primaryBuildingType) > -1) {
      occupantShowerPercent = assumedShowerPercent;
      minutesPerShower = 7.8;
    } else {
      occupantShowerPercent = toNumber(fixture.shower_usage) / 100;
      minutesPerShower = 5.3;
    }
    const showersPerYear = this.occupantsPerDay(audit) * daysPerYear * occupantShowerPercent;

    return (showersPerYear * minutesPerShower * averageShowerFlowRate) / 1000;
  };

  occupantsInDay = (values, occupancy, totalBuildingGroupOccupancy) => {
    if (occupancy == 'lodging') {
      const totalLodging = toNumber(selectn('plumbing.lodging.total_population')(values));
      const totalAverageLodging = (totalLodging * 12) / 365;
      let auditTotalLodging = 0;
      values.audits.forEach(audit => {
        const building = values.buildings.find(building => building.name == audit.name);
        const primaryBuildingType = building.primary_building_type;
        if (assumedTypes.indexOf(primaryBuildingType) > -1) {
          auditTotalLodging += this.occupantsPerDay(audit);
        }
      });
      return totalAverageLodging - auditTotalLodging;
    }
    if (occupancy === 'admin' || occupancy === 'healthWorker') {
      const dailyStaff = toNumber(selectn('plumbing.hospital.daily_staff')(values));
      const adminStaffPercentage = toNumber(selectn('plumbing.hospital.administrative')(values)) / 100;
      const adminStaff = dailyStaff * adminStaffPercentage;
      if (occupancy == 'admin') {
        return adminStaff;
      }
      if (occupancy === 'healthWorker') {
        return dailyStaff - adminStaff;
      }
    }
    if (occupancy === 'outpatient') {
      return toNumber(selectn('plumbing.hospital.outpatient_visits')(values));
    }
    if (occupancy === 'inpatient') {
      return toNumber(selectn('plumbing.hospital.inpatient_per_day')(values));
    }
    if (occupancy === 'generalWeekDay') {
      const totalPopulation = toNumber(selectn('plumbing.facility.total_population')(values));
      return totalPopulation - totalBuildingGroupOccupancy;
    }
    if (occupancy === 'generalWeekend') {
      const totalPopulation = toNumber(selectn('plumbing.facility.total_population_weekends')(values));
      return totalPopulation - totalBuildingGroupOccupancy;
    }
  };

  getTotalBuildingGroupOccupancy(values, occupancy) {
    if (occupancy == 'lodging') {
      let totalOccupancy = 0;
      values.audits.forEach(audit => {
        const building = values.buildings.find(building => building.name == audit.name);
        const primaryBuildingType = building.primary_building_type;
        if (assumedTypes.indexOf(primaryBuildingType) > -1) {
          totalOccupancy += toNumber(audit.weekday_occupancy);
        }
      });
      return totalOccupancy;
    }
    if (hospitalTypes.indexOf(occupancy) > -1) {
      let totalAdmin = 0;
      values.audits.forEach(audit => {
        const building = values.buildings.find(building => building.name == audit.name);
        const primaryBuildingType = building.primary_building_type;
        if (primaryBuildingType === 'hospital' || primaryBuildingType === 'clinic') {
          totalAdmin += toNumber(audit.weekday_occupancy);
        }
      });
      return totalAdmin;
    }
    if (occupancy === 'generalWeekDay' || occupancy === 'generalWeekend') {
      let totalBuilding = 0;
      const field = occupancy === 'generalWeekDay' ? 'weekday_occupancy' : 'weekend_occupancy';
      values.audits.forEach(audit => {
        const building = values.buildings.find(building => building.name == audit.name);
        const primaryBuildingType = building.primary_building_type;
        if (primaryBuildingType === 'other') {
          if (building.building_occupants && building.building_occupants !== 'transient') {
            totalBuilding += toNumber(audit[field]);
          }
        }
      });
      return totalBuilding;
    }
    return 0;
  }

  hoursOccupiedPerDay(values, occupancy, totalBuildingGroupOccupancy) {
    if (occupancy == 'lodging') {
      return 8;
    }
    if (occupancy === 'admin' || occupancy === 'healthWorker') {
      return toNumber(selectn('plumbing.hospital.staff_shift')(values));
    }
    if (occupancy === 'outpatient') {
      return toNumber(selectn('plumbing.hospital.outpatient_duration')(values));
    }
    if (occupancy === 'inpatient') {
      return 24;
    }
    if (occupancy === 'generalWeekDay' || occupancy === 'generalWeekend') {
      const occupancyField = occupancy === 'generalWeekDay' ? 'weekday_occupancy' : 'weekend_occupancy';
      const hoursOccupiedField = occupancy === 'generalWeekDay' ? 'week_days_hours' : 'weekend_days_hours';
      let totalBuilding = 0;
      values.audits.forEach(audit => {
        const building = values.buildings.find(building => building.name == audit.name);
        const primaryBuildingType = building.primary_building_type;
        if (primaryBuildingType == 'other') {
          totalBuilding += (toNumber(audit[occupancyField]) / totalBuildingGroupOccupancy) * toNumber(audit[hoursOccupiedField]);
        }
      });
      return totalBuilding;
    }
  }

  daysOccupiedPerYear(values, occupancy) {
    if (occupancy == 'lodging') {
      return 350;
    }
    if (hospitalTypes.indexOf(occupancy) > -1) {
      return selectn('plumbing.hospital.days_per_year')(values);
    }
    if (occupancy === 'generalWeekDay' || occupancy === 'generalWeekend') {
      let totalBuilding = 0;
      let buildingCount = 0;
      const occupancyField = occupancy === 'generalWeekDay' ? 'week_days_year' : 'weekend_days_year';
      values.audits.forEach(audit => {
        const building = values.buildings.find(building => building.name == audit.name);
        const primaryBuildingType = building.primary_building_type;
        if (primaryBuildingType == 'other') {
          totalBuilding += toNumber(audit[occupancyField]);
          buildingCount++;
        }
      });
      return totalBuilding / buildingCount;
    }
  }

  calculateAverage(values, totalBuildingGroupOccupancy, occupancy, field) {
    let totalBuilding = 0;

    values.fixtures.forEach(fixture => {
      const building = values.buildings.find(building => building.name == fixture.name);
      const audit = values.audits.find(building => building.name == fixture.name);
      const primaryBuildingType = building.primary_building_type;
      const isLodging = occupancy === 'lodging' && assumedTypes.indexOf(primaryBuildingType) > -1;
      const isHospital = hospitalTypes.indexOf(occupancy) > -1 && (primaryBuildingType == 'clinic' || primaryBuildingType == 'hospital');
      const isGeneralWeekDay = occupancy === 'generalWeekDay' && primaryBuildingType === 'other' && building.building_occupants === 'stationary';
      const isGeneralWeekEnd = occupancy === 'generalWeekend' && building.building_occupants === 'stationary';
      if (isLodging || isHospital || isGeneralWeekDay || isGeneralWeekEnd) {
        const auditField = isGeneralWeekEnd ? 'weekend_occupancy' : 'weekday_occupancy';
        totalBuilding += (toNumber(audit[auditField]) / totalBuildingGroupOccupancy) * toNumber(fixture[field]);
      }
    });
    return totalBuilding ? totalBuilding : 0;
  }

  getFixtureOccupancy(values, occupancy, field) {
    let fixtureOccupancy = 0;
    values.fixtures.forEach(fixture => {
      const building = values.buildings.find(building => building.name == fixture.name);
      const primaryBuildingType = building.primary_building_type;
      const isLodging = occupancy === 'lodging' && assumedTypes.indexOf(primaryBuildingType) > -1;
      const isHospital = hospitalTypes.indexOf(occupancy) > -1 && (primaryBuildingType == 'clinic' || primaryBuildingType == 'hospital');
      const isGeneralWeekDay = occupancy === 'generalWeekDay' && primaryBuildingType === 'other' && building.building_occupants === 'stationary';
      const isGeneralWeekEnd = occupancy === 'generalWeekend' && building.building_occupants === 'stationary';
      if (isLodging || isHospital || isGeneralWeekDay || isGeneralWeekEnd) {
        const auditField = isGeneralWeekEnd ? 'weekend_occupancy' : 'weekday_occupancy';
        const audit = values.audits.find(building => building.name == fixture.name);
        const hasFixture =
          (field == 'urinals' && fixture[field] == 'yes') ||
          (field == 'kitchenette_flow_rate' && toNumber(fixture[field]) !== 0) ||
          (field == 'aerator_flow_rate' && toNumber(fixture[field]) !== 0) ||
          (field == 'shower_flow_rate' && toNumber(fixture[field]) !== 0);
        if (hasFixture) {
          fixtureOccupancy += toNumber(audit[auditField]);
        }
      }
    });
    return fixtureOccupancy;
  }

  calculateWeightedAverageUrinals(values, totalHoursOccupied, totalBuildingGroupOccupancy, percentMale, occupancy) {
    let totalFlushesPerYear = 0;
    const urinalOccupancy = this.getFixtureOccupancy(values, occupancy, 'urinals');
    const averageFlushRate = this.calculateAverage(values, urinalOccupancy, occupancy, 'urinal_flush_rate');
    const urinalFlushesPerPersonPerHour = occupancy === 'inpatient' ? 4 : 0.25;

    if (occupancy === 'lodging') {
      totalFlushesPerYear =
        totalHoursOccupied * (urinalOccupancy / totalBuildingGroupOccupancy) * urinalFlushesPerPersonPerHour * (toNumber(percentMale) / 100);
    } else {
      totalFlushesPerYear = totalHoursOccupied * urinalFlushesPerPersonPerHour * (toNumber(percentMale) / 100);
    }
    return (totalFlushesPerYear * averageFlushRate) / 1000;
  }

  calculateWeightedAverageToilets(values, totalHoursOccupied, totalBuildingGroupOccupancy, percentMale, occupancy) {
    const averageFlushRate = this.calculateAverage(values, totalBuildingGroupOccupancy, occupancy, 'typical_flush_rate');
    const maleFlushesPerPerson = occupancy === 'inpatient' ? 3 : 0.125;
    const femaleFlushesPerPerson = occupancy === 'inpatient' ? 7 : 0.375;
    const maleFlushesPerYear = (totalHoursOccupied * maleFlushesPerPerson * percentMale) / 100;
    const femaleFlushes = totalHoursOccupied * femaleFlushesPerPerson * (1 - percentMale / 100);
    return ((maleFlushesPerYear + femaleFlushes) * averageFlushRate) / 1000;
  }

  calculateWeightedAverageRestroomSink(values, totalHoursOccupied, occupancy) {
    let minutesUsedPerHour = 0;
    const restroomSinkOccupancy = this.getFixtureOccupancy(values, occupancy, 'aerator_flow_rate');
    const averageFlowRate = this.calculateAverage(values, restroomSinkOccupancy, occupancy, 'aerator_flow_rate');
    if (occupancy == 'lodging') {
      minutesUsedPerHour = 0.25;
    } else if (occupancy == 'healthWorker') {
      minutesUsedPerHour = 1.05;
    } else {
      minutesUsedPerHour = 0.125;
    }
    const totalMinutesPerYear = minutesUsedPerHour * totalHoursOccupied;
    return (averageFlowRate * totalMinutesPerYear) / 1000;
  }

  calculateWeightedAverageKitchenettes(values, occupantsInDay, daysOccupiedPerYear, occupancy) {
    let minutesUsedPerDay = 0;
    if (occupancy == 'lodging') {
      minutesUsedPerDay = 0.25;
    } else if (occupancy == 'outpatient' || occupancy == 'inpatient') {
      minutesUsedPerDay = 0;
    } else {
      minutesUsedPerDay = 0.5;
    }
    const kitchenSinkOccupancy = this.getFixtureOccupancy(values, occupancy, 'kitchenette_flow_rate');
    const averageFlowRate = this.calculateAverage(values, kitchenSinkOccupancy, occupancy, 'kitchenette_flow_rate');
    const totalMinutesUsedPerYear = minutesUsedPerDay * occupantsInDay * daysOccupiedPerYear;

    return (totalMinutesUsedPerYear * averageFlowRate) / 1000;
  }

  calculateWeightedAverageShowers(values, totalBuildingGroupOccupancy, occupantsInDay, daysOccupiedPerYear, occupancy) {
    let occupantShowerPercent = 0;
    let timePerUse = 0;
    if (occupancy === 'lodging') {
      occupantShowerPercent = 0.69;
    } else if (occupancy === 'outpatient') {
      occupantShowerPercent = 0;
    } else {
      occupantShowerPercent = this.calculateAverage(values, totalBuildingGroupOccupancy, occupancy, 'shower_usage') / 100;
    }

    if (occupancy === 'lodging' || occupancy === 'inpatient') {
      timePerUse = 7.8;
    } else if (occupancy === 'outpatient') {
      timePerUse = 0;
    } else {
      timePerUse = 5.3;
    }

    const showersPerYear = occupantShowerPercent * daysOccupiedPerYear * occupantsInDay;
    const showerOccupancy = this.getFixtureOccupancy(values, occupancy, 'shower_flow_rate');
    const averageFlowRate = this.calculateAverage(values, showerOccupancy, occupancy, 'shower_flow_rate');
    return (showersPerYear * averageFlowRate * timePerUse) / 1000;
  }

  checkFixtures(values) {
    const fixtures = values.fixtures.map(fixture => fixture.name);
    return values.audits.some(audit => !fixtures.includes(audit.name));
  }

  calculateWeekdayOccupancy(audit, values, primary_building_type) {
    const weekdayStaff = toNumber(audit.weekday_staff);
    const outpatientWeekday = toNumber(audit.outpatient_weekday);
    const staffShift = toNumber(selectn('plumbing.hospital.staff_shift')(values));

    let weekDayOccupancy = weekdayStaff + outpatientWeekday * (1 / staffShift);
    if (primary_building_type === 'hospital') {
      weekDayOccupancy += toNumber(audit.inpatient_weekday);
    }
    return weekDayOccupancy;
  }

  calculateWeekendOccupancy(audit, values, primary_building_type) {
    const weekendStaff = toNumber(audit.weekend_staff);
    const outpatientWeekend = toNumber(audit.outpatient_weekend);
    const staffShift = toNumber(selectn('plumbing.hospital.staff_shift')(values));

    let weekendOccupancy = weekendStaff + outpatientWeekend * (1 / staffShift);
    if (primary_building_type === 'hospital') {
      weekendOccupancy += toNumber(audit.inpatient_weekend);
    }
    return weekendOccupancy;
  }

  calculateWaterUse = (values, valid) => {
    const needsFixtureInformation = this.checkFixtures(values);
    if (!valid) {
      window.alert('Missing or incorrect values.');
      return;
    }
    if (needsFixtureInformation) {
      window.alert('Enter fixture information for each audited building.');
      return;
    }

    let waterCategoryTotal = {};
    let weightedCategoriesTotal = {};
    let totalWater = 0;

    values.audits.forEach(audit => {
      const building = values.buildings.find(building => building.name == audit.name);
      const primaryBuildingType = building.primary_building_type;
      if (primaryBuildingType === 'clinic' || primaryBuildingType === 'hospital') {
        audit.weekday_occupancy = this.calculateWeekdayOccupancy(audit, values, primaryBuildingType);
        audit.weekend_occupancy = this.calculateWeekendOccupancy(audit, values, primaryBuildingType);
      }
      const isTransient = building.building_occupants && building.building_occupants === 'transient';
      const fixture = values.fixtures.find(fixture => fixture.name == building.name);
      const {totalHoursOccupiedPerYear, daysPerYear} = this.getOccupancy(audit, primaryBuildingType, isTransient);

      const urinals = this.calculateUrinals(fixture, primaryBuildingType, audit, totalHoursOccupiedPerYear);
      const toilets = this.calculateToilets(fixture, audit, totalHoursOccupiedPerYear);
      const restroomSink = this.calculateRestroomSink(fixture, primaryBuildingType, totalHoursOccupiedPerYear);
      const kitchenSinks = this.calculateKitchenSink(fixture, audit, primaryBuildingType, daysPerYear);
      const showers = this.calculateShowers(fixture, audit, primaryBuildingType, daysPerYear);
      if (!waterCategoryTotal[primaryBuildingType]) {
        waterCategoryTotal[primaryBuildingType] = 0;
      }
      const auditTotal = urinals + toilets + restroomSink + kitchenSinks + showers;
      waterCategoryTotal[primaryBuildingType] += auditTotal;
      totalWater += auditTotal;
    });

    let auditTotalOccupancy = 0;
    const totalOccupancy =
      toNumber(selectn(`plumbing.facility.total_population`)(values)) +
      toNumber(selectn(`plumbing.facility.total_population_weekends`)(values)) +
      toNumber(selectn(`plumbing.hospital.daily_staff`)(values)) +
      toNumber(selectn(`plumbing.lodging.total_population`)(values));

    values.audits.forEach(audit => (auditTotalOccupancy += toNumber(audit.week_day_occupancy) + toNumber(audit.weekend_occupancy)));

    if (auditTotalOccupancy < totalOccupancy) {
      const occupancyGroups = ['lodging', 'admin', 'healthWorker', 'outpatient', 'inpatient', 'generalWeekDay', 'generalWeekend'];
      occupancyGroups.forEach(occupancy => {
        const totalBuildingGroupOccupancy = this.getTotalBuildingGroupOccupancy(values, occupancy);
        const occupantsInDay = this.occupantsInDay(values, occupancy, totalBuildingGroupOccupancy);
        const hoursOccupiedPerDay = this.hoursOccupiedPerDay(values, occupancy, totalBuildingGroupOccupancy);
        const daysOccupiedPerYear = this.daysOccupiedPerYear(values, occupancy);
        let totalHoursOccupied = 0;
        if (occupancy === 'inpatient') {
          totalHoursOccupied = occupantsInDay * daysOccupiedPerYear;
        } else {
          totalHoursOccupied = occupantsInDay * hoursOccupiedPerDay * daysOccupiedPerYear;
        }
        const percentMale =
          occupancy === 'admin' || occupancy === 'healthWorker'
            ? selectn('plumbing.hospital.hospital_male')(values)
            : selectn('plumbing.facility.male_population')(values);
        const urinal = this.calculateWeightedAverageUrinals(values, totalHoursOccupied, totalBuildingGroupOccupancy, percentMale, occupancy);
        const toilets = this.calculateWeightedAverageToilets(values, totalHoursOccupied, totalBuildingGroupOccupancy, percentMale, occupancy);
        const restroomSink = this.calculateWeightedAverageRestroomSink(values, totalHoursOccupied, occupancy);
        const kitchenettes = this.calculateWeightedAverageKitchenettes(values, occupantsInDay, daysOccupiedPerYear, occupancy);
        const showers = this.calculateWeightedAverageShowers(values, totalBuildingGroupOccupancy, occupantsInDay, daysOccupiedPerYear, occupancy);
        const total = (urinal || 0) + (toilets || 0) + (restroomSink || 0) + (kitchenettes || 0) + (showers || 0);
        totalWater += total;
        weightedCategoriesTotal[occupancy] = total;
      });
    }

    values.plumbing.lodging_water_usage = numberFormat.format(
      (waterCategoryTotal['family'] || 0) +
        (waterCategoryTotal['hotel'] || 0) +
        (waterCategoryTotal['barracks'] || 0) +
        (weightedCategoriesTotal['lodging'] || 0)
    );
    values.plumbing.hospital_water_usage = numberFormat.format(
      (waterCategoryTotal['hospital'] || 0) +
        (waterCategoryTotal['clinic'] || 0) +
        (weightedCategoriesTotal['admin'] || 0) +
        (weightedCategoriesTotal['healthWorker'] || 0) +
        (weightedCategoriesTotal['outpatient'] || 0) +
        (weightedCategoriesTotal['inpatient'] || 0)
    );
    values.plumbing.overall_water_usage = numberFormat.format(
      (waterCategoryTotal['other'] || 0) + (weightedCategoriesTotal['generalWeekDay'] || 0) + (weightedCategoriesTotal['generalWeekend'] || 0)
    );

    let formatTotal = numberFormat.format(totalWater);

    values.plumbing.water_usage = formatTotal;
    this.setState({
      waterUse: ' Water Use: ' + formatTotal + ' kgal'
    });
  };

  clearValues = (clearValues, basePath, values) => {
    let field = basePath.split('[');
    let path = field[0];
    let index = field[1].replace(']', '');
    for (let i = 0; i < clearValues.length; i++) {
      if (values[path] != undefined) {
        values[path][index][clearValues[i]] = null;
      }
    }
  };

  clearSection = (values, name) => {
    if (values['plumbing'][name] != undefined) {
      if (!(Object.keys(values['plumbing'][name]).length === 0)) {
        values['plumbing'][name] = null;
      }
    }
  };

  onSubmit = values => {};

  flushRate = (basePath, values) => {
    const source = selectn(`${basePath}.name`)(values);
    const flowRate = selectn(`${basePath}.shower_flow_rate`)(values);
    const building = source && values.buildings.find(building => building.name === source);
    const buildingType = building ? building.primary_building_type : null;
    return (
      <Grid container alignItems='flex-start' spacing={16}>
        <Field
          formControlProps={{fullWidth: true}}
          required
          name={`${basePath}.typical_flush_rate`}
          component={MaterialInput}
          type='text'
          mask={DEFAULT_DECIMAL_MASK}
          label={'What is the typical flush rate of toilets in ' + source + '?'}
          endAdornment={<InputAdornment position='end'>gpf</InputAdornment>}
        />
        {buildingType !== 'family' && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true, required: true}}
              name={`${basePath}.urinals`}
              component={Select}
              label={'Are urinals typically present in ' + source + '?'}
            >
              <MenuItem value='yes'>Yes</MenuItem>
              <MenuItem value='no'>No</MenuItem>
            </Field>
          </Grid>
        )}
        {selectn(`${basePath}.urinals`)(values) === 'yes' && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true}}
              required
              name={`${basePath}.urinal_flush_rate`}
              component={MaterialInput}
              type='text'
              mask={DEFAULT_DECIMAL_MASK}
              label={'What is the typical flush rate of urinals in ' + source + '?'}
              endAdornment={<InputAdornment position='end'>gpf</InputAdornment>}
            />
          </Grid>
        )}

        {selectn(`${basePath}.urinals`)(values) == 'No' && this.clearValues(['urinal_flush_rate'], basePath, values)}
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.aerator_flow_rate`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_DECIMAL_MASK}
            label={'What is the typical flow rate of restroom faucet aerators in ' + source + '?'}
            endAdornment={<InputAdornment position='end'>gpm</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.kitchenette_flow_rate`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_DECIMAL_MASK}
            label={'What is the typical flow rate of kitchenette faucet aerators in ' + source + '? Please put 0 if no kitchenettes are present.'}
            endAdornment={<InputAdornment position='end'>gpm</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.shower_flow_rate`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_DECIMAL_MASK}
            label={'What is the typical flow rate of showers in ' + source + '? Please put 0 in if no showers are present.'}
            endAdornment={<InputAdornment position='end'>gpm</InputAdornment>}
          />
        </Grid>
        {flowRate != 0 && flowRate != undefined && assumedTypes.indexOf(buildingType) === -1 && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true}}
              required
              name={`${basePath}.shower_usage`}
              component={MaterialInput}
              type='text'
              mask={DEFAULT_DECIMAL_MASK}
              label={'What is the estimated percentage of occupants in ' + source + ' that use showers on a daily basis?'}
              endAdornment={<InputAdornment position='end'>%</InputAdornment>}
            />
          </Grid>
        )}
        {assumedTypes.indexOf(buildingType) !== -1 && this.clearValues(['shower_usage'], basePath, values)}
      </Grid>
    );
  };

  renderFacilityTypes = (values, valid) => {
    const facilities = values.fixtures.map(facility => facility.name);
    return (
      <Fragment>
        <FieldArray name='fixtures'>
          {({fields}) =>
            fields.map((name, index) => (
              <Grid item xs={12} key={index}>
                <ExpansionPanel style={expansionPanel} expanded={selectn(`${name}.name`)(values) !== undefined}>
                  <ExpansionPanelSummary>
                    <Field
                      formControlProps={{fullWidth: true, required: true}}
                      name={`${name}.name`}
                      component={Select}
                      label='Select a unique name identifier for this building from the dropdown list.'
                    >
                      {values.audits.map(building => {
                        const disabled = facilities.indexOf(building.name) > -1;
                        const primary_building_type = values.buildings.find(item => item.name === building.name).primary_building_type;
                        return (
                          <MenuItem disabled={disabled} value={building.name}>
                            {`${building.name} (${buildingTypeMap[primary_building_type]})`}
                          </MenuItem>
                        );
                      })}
                    </Field>
                    {values.fixtures && values.fixtures.length > 1 && (
                      <IconButton
                        style={{padding: 'initial', height: '40px', width: '40px'}}
                        onClick={() => fields.remove(index)}
                        aria-label='Delete'
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails style={{paddingLeft: '40px', ...expansionDetails}}>
                    <Grid container alignItems='flex-start' spacing={16}>
                      {this.flushRate(`${name}`, values)}
                    </Grid>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </Grid>
            ))
          }
        </FieldArray>
        <Grid item xs={12} sm={3}>
          <Field
            fullWidth
            disabled
            name='plumbing.lodging_water_usage'
            label='On-Site Lodging Water Use'
            component={MaterialInput}
            type='text'
            endAdornment={<InputAdornment position='end'>kgal</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Field
            fullWidth
            disabled
            name='plumbing.hospital_water_usage'
            label='Hospital/Medical Clinic Water Use'
            component={MaterialInput}
            type='text'
            endAdornment={<InputAdornment position='end'>kgal</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Field
            fullWidth
            disabled
            name='plumbing.overall_water_usage'
            label='General Campus'
            component={MaterialInput}
            type='text'
            endAdornment={<InputAdornment position='end'>kgal</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Field
            fullWidth
            disabled
            name='plumbing.water_usage'
            label='Total Water Use'
            component={MaterialInput}
            type='text'
            meta={{
              visited: true,
              error:
                valid || selectn('plumbing.water_usage')(values) == null ? null : "Fix errors and click 'Calculate Water Use' button to update value."
            }}
            endAdornment={<InputAdornment position='end'>kgal</InputAdornment>}
          />
        </Grid>
      </Fragment>
    );
  };

  updateIsDirty = (dirty, updateParent) => {
    if (dirty && this.state.isDirty != true) {
      this.setState({isDirty: true});
      updateParent();
    }
  };

  addAnotherBuildingButton = (values, push) => {
    const moreBuildings = values.fixtures && values.buildings && values.buildings.length > values.fixtures.length;
    if (moreBuildings) {
      return (
        <Button style={{marginRight: '10px'}} variant='contained' color='primary' onClick={() => push('fixtures', {})}>
          Add Another Building
        </Button>
      );
    }
  };

  check(values, occupancyTypes) {
    const occupancyTypeBuildings = values.buildings.filter(building => occupancyTypes.includes(building.primary_building_type));
    if (occupancyTypeBuildings.length) {
      const names = occupancyTypeBuildings.map(building => building.name);
      return !values.audits.some(audit => names.includes(audit.name));
    }
  }

  render() {
    const {createOrUpdateCampusModule, campus, applyRules, updateParent} = this.props;
    const module = campus ? campus.modules.plumbing : {};
    let error;
    if (!('fixtures' in module)) {
      module.fixtures = [];
      module.fixtures.push({});
    }
    if (!('buildings' in module)) {
      module.buildings = [];
      module.buildings.push({});
    }
    if (!('audits' in module)) {
      module.audits = [];
      module.audits.push({});
    }
    const needsBuildings = module.buildings.some(building => building.name === undefined);
    const needsAudit = module.audits.some(audit => audit.name === undefined);
    const occupancyErrors = validate(module);
    const hasOccupancyErrors = Object.keys(occupancyErrors.plumbing).length > 0;
    const needsLodgingAudit = this.check(module, ['barracks', 'hotel', 'family']);
    const needsHospitalAudit = this.check(module, ['clinic', 'hospital']);
    const needsOtherAudit = this.check(module, ['other']);
    if (needsBuildings) {
      error = "Add buildings in the 'General Buildings' tab before adding fixture information";
    } else if (needsAudit) {
      error = "Add occupancy information for buildings in the 'Occupancy' tab before adding fixture information.";
    } else if (hasOccupancyErrors) {
      error = "Fill out all required fields in the 'Occupancy' tab before adding fixture information";
    } else if (needsLodgingAudit) {
      error =
        "Enter occupancy information for at least one building that has a primary building type of 'Barracks/Dormitory', 'Hotel/Motel', or 'Family Housing' in the 'Occupancy' tab";
    } else if (needsHospitalAudit) {
      error =
        "Enter occupancy information for at least one building that has a primary building type of 'Hospital' or 'Medical Clinic' in the 'Occupancy' tab";
    } else if (needsOtherAudit) {
      error = "Enter occupancy information for at least one building that has a primary building type of 'Other' in the 'Occupancy' tab";
    }
    const hasErrors = needsBuildings || needsAudit || hasOccupancyErrors || needsLodgingAudit || needsHospitalAudit || needsOtherAudit;
    return (
      <Fragment>
        <Typography variant='h5' gutterBottom>
          Plumbing Fixtures
        </Typography>
        <Typography variant='body2' gutterBottom>
          Enter the following information on campus occupancy groups and installed fixtures. Note that fixture information will only be entered for
          occupancy groups present on the campus.
        </Typography>
        <Handbook sectionName={'Plumbing Fixtures'} style={{marginBottom: '25px'}}/>
        <Form
          onSubmit={this.onSubmit}
          initialValues={module}
          validate={formValidation}
          mutators={{...arrayMutators}}
          decorators={[focusOnError]}
          render={({
            handleSubmit,
            dirty,
            values,
            valid,
            form: {
              mutators: {push, pop}
            }
          }) => (
            <form onSubmit={handleSubmit} noValidate>
              {hasErrors ? (
                <Typography variant='body2' gutterBottom>
                  <WarningIcon style={{color: '#F8A000', margin: '15px 7px -5px 11px'}} />
                  {error}
                </Typography>
              ) : (
                <Grid container alignItems='flex-start' spacing={16}>
                  {this.renderFacilityTypes(values, valid)}
                  <Grid item xs={12}>
                    {this.addAnotherBuildingButton(values, push)}
                    <Button variant='contained' type='submit' onClick={() => this.calculateWaterUse(values, valid)}>
                      Calculate Water Use
                    </Button>
                    <Button
                      variant='contained'
                      type='button'
                      onClick={() => submitAlert(valid, createOrUpdateCampusModule, values)}
                      style={{marginLeft: '10px'}}
                    >
                      Save
                    </Button>
                    {this.state.waterUse != '' && (
                      <Fab color='primary' aria-label='Water Use' title='Water Use' style={fabStyle}>
                        {this.state.waterUse}
                      </Fab>
                    )}
                  </Grid>
                  {this.updateIsDirty(dirty, updateParent)}
                  <FormRulesListener handleFormChange={applyRules} />
                </Grid>
              )}
            </form>
          )}
        />
      </Fragment>
    );
  }
}

export default PlumbingForm;
