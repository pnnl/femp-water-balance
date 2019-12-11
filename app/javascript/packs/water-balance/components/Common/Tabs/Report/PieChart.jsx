import React, { Fragment } from 'react';
import Typography from '@material-ui/core/Typography';
import { DiscreteColorLegend, RadialChart, Hint } from 'react-vis';
import Tooltip from '@material-ui/core/Tooltip';

const title = {
    textAlign: 'center',
    marginTop: '14px',
};

const legend = {
    width: '35%',
    float: 'right',
    marginTop: '145px',
};

const pieChart = {
    float: 'left',
    width: '65%',
    paddingLeft: '49px',
    margin: '48px 0px',
};

class BarChart extends React.Component {
    state = {
        value: '',
        active: false,
    };

    onValueMouseOver = v => {
        this.setState({ value: v, active: true });
    };

    onSeriesMouseOut = () => {
        this.setState({ active: false });
    };

    render(props) {
        const { value, active } = this.state;
        let waterUse = this.props.data;
        let data = [];
        let i = 0;
        waterUse.map((key, i) => {
            const colors = [
                '#47ACB1',
                '#FF991F',
                '#FFCD33',
                '#F9AA7B',
                '#F26522',
                '#703740',
                '#A5A8AA',
                '#ADD5D7',
                '#676766',
            ];

            if (key.water != 0 && key.name != 'Total Water Supply') {
                data.push({
                    label: key.name.toString(),
                    angle: key.water,
                    color: colors[i++],
                    water: key.water,
                    percent: key.percent,
                });
            }
        });
        return (
            <Fragment>
                <div className="pie-chart-container">
                    <Typography style={title} variant="body2" gutterBottom>
                        Water Balance Pie Chart
                    </Typography>
                    <Tooltip
                        placement="top"
                        title={`${value.label} :${value.percent}%`}
                        interactive={active}
                    >
                        <div style={pieChart}>
                            <RadialChart
                                data={data}
                                height={300}
                                width={300}
                                margin={{
                                    left: 70,
                                    right: 10,
                                    top: 30,
                                    bottom: 90,
                                }}
                                colorType="literal"
                                onValueMouseOver={this.onValueMouseOver}
                                onSeriesMouseOut={this.onSeriesMouseOut}
                            ></RadialChart>
                        </div>
                    </Tooltip>
                    <div style={legend}>
                        <DiscreteColorLegend
                            items={data.map(d => d.label)}
                            colors={data.map(d => d.color)}
                        />
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default BarChart;
