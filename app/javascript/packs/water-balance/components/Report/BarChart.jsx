import React, { Fragment } from "react";
import Typography from "@material-ui/core/Typography";
import "./report.css";
import { XYPlot, VerticalBarSeries, XAxis, YAxis } from "react-vis";

class BarChart extends React.Component {
	render(props) {
		let waterUse = this.props.data;
		let data = [];
		waterUse.map(key => {
			if (key.water != 0 && key.name != "Total Water Supply") {
				data.push({ x: key.name.toString(), y: key.water });
			}
		});
		return (
			<Fragment>
				<Typography className='title' variant='body2' gutterBottom>
					Water Balance Results Bar Chart
				</Typography>
				<div className='bar-chart'>
					<XYPlot
						height={350}
						width={550}
						xType='ordinal'
						color='#0097be'
						margin={{ left: 70, right: 10, top: 30, bottom: 120 }}
					>
						<XAxis tickLabelAngle={-45} />
						<YAxis />
						<VerticalBarSeries data={data} style={{}} />
					</XYPlot>
				</div>
			</Fragment>
		);
	}
}

export default BarChart;
