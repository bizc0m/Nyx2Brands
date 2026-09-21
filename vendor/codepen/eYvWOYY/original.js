let width, height, gradient;
function getGradient(ctx, chartArea) {
  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;
  if (gradient === null || width !== chartWidth || height !== chartHeight) {
    // Create the gradient because this is either the first render
    // or the size of the chart has changed
    width = chartWidth;
    height = chartHeight;
    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, '#C849E1');
    gradient.addColorStop(0.5, '#662E9B');
  }

  return gradient;
}

const labels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul'
];
const data = {
  labels: labels,
  datasets: [{
    label: 'Visitors',
    backgroundColor: '#C849E1',
    borderColor: function(context) {
        const chart = context.chart;
        const {ctx, chartArea} = chart;

        if (!chartArea) {
          // This case happens on initial chart load
          return null;
        }
        return getGradient(ctx, chartArea);
      },
    data: [134, 100, 100, 200, 300, 100, 500],
  }]
};
const config = {
  type: 'line',
  data,
  options: {
    elements: {
        line: {
            tension: 0.4
        }
    },
    bezierCurve:true,
    plugins:{
      legend:{
        display:false,
      }
    },
    scales:{
      xAxis:{
        grid:{
          display:false,
        },
        ticks:{
          color:'#1d1d1d',
          font:{family:"'Poppins',sans-serif"}
        }
      },
      yAxis:{
        grid:{
          display:false,
        },
        ticks:{
          display:false,
        }
      },
    }
  }
};
var myChart = new Chart(
    document.getElementById('myChart'),
    config
  );
new Chart(myChart, config);

const logo = document.querySelector('.logo');

logo.addEventListener('click', ()=>{
  document.body.style.setProperty('--color', '#1d1d1d')
  console.log("alo")
})