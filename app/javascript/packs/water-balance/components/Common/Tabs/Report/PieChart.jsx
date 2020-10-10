import React from 'react';
import Typography from '@material-ui/core/Typography';
import { RadialChart, makeVisFlexible } from 'react-vis';
import Tooltip from '@material-ui/core/Tooltip';
import '../../../../../../../../node_modules/react-vis/dist/style.css';


const FlexibleRadialChart = makeVisFlexible(RadialChart);

const title = {
    textAlign: 'center',
    paddingTop: '14px',
};

const legend = {
    width: '92%',
    float: 'right',
    columnCount: '3',
    margin: '5% 0  0 8%',
};

const pieChart = {
    margin: '32px 0 11px 0',
};

const fontStyle = {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif'
}

const legendTitle = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '12px',
    padding: '5px 1px',
}

const square ={
    height: '12px',
    width: '12px',
    marginRight: '7px',
    float: 'left',
    borderRadius: '8px'
}

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
            <div style={fontStyle}>
                <div className="pie-chart-container">
                    <Typography style={title} variant="body2" gutterBottom>
                        Water Balance Pie Chart
                    </Typography>
                    <Tooltip
                        placement="top"
                        title={`${value.label}: ${value.percent}%`}
                        interactive={active}
                    >
                        <div style={pieChart}>
                            <FlexibleRadialChart
                                data={data}
                                height={300}
                                colorType="literal"
                                onValueMouseOver={this.onValueMouseOver}
                                onSeriesMouseOut={this.onSeriesMouseOut}
                            ></FlexibleRadialChart>
                        </div>
                    </Tooltip>
                </div>
                <div style={legend}>
                    {data.map(d => 
                        <div style={legendTitle}>
                            <div style={{...square, backgroundColor: d.color}} />
                            {d.label}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default BarChart;
