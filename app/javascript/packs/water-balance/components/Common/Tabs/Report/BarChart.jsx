import React, { Fragment } from 'react';
import Typography from '@material-ui/core/Typography';
import { XYPlot, VerticalBarSeries, XAxis, YAxis,  makeVisFlexible} from 'react-vis';

const title = {
	textAlign: 'center',
	paddingTop: '14px',
};

const barChart = {
	marginBottom: '24px',
	height: '100%',
	fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
};
const FlexibleXYPlot = makeVisFlexible(XYPlot);
class BarChart extends React.Component {
	render(props) {
		let waterUse = this.props.data;
		let data = [];
		waterUse.map(key => {
			if (key.water != 0 && key.name != 'Total Water Supply') {
				data.push({ x: key.name.toString(), y: key.water });
			}
		});
		return (
			<Fragment>
				<Typography style={title} variant='body2' gutterBottom>
					Water Balance Results Bar Chart (kgal)
				</Typography>
				<div style={barChart}>
					<FlexibleXYPlot
						height={390}
						xType='ordinal'
						color='#0097be'
						margin={{ left: 70, right: 20, top: 95, bottom: 120 }}
					>
						<XAxis tickLabelAngle={-45} />
						<YAxis />
						<VerticalBarSeries data={data} style={{}} />
					</FlexibleXYPlot>
				</div>
			</Fragment>
		);
	}
}

export default BarChart;
