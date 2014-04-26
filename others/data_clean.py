# data wrangling
# not used

import csv
import json
import io
import numpy as np

stations = np.recfromcsv('dc-stations.csv', delimiter=',')

print stations

output = {}

for k in stations:

    for d in data[k]:
        date = time.strptime(d['date'], "%b %d, %Y %I:%M:%S %p")
        if k in output:
            t = ampmformat('%02d:%02d:%02d' % (date.tm_hour, date.tm_min, date.tm_sec))
            h = date.tm_hour
            output[k]['sum'] += d['value']
            output[k]['hourly'][h] += d['value']
        else:
            output[k] =  { "sum": 0,
                "hourly": [0]*24
            }

            t = ampmformat('%02d:%02d:%02d' % (date.tm_hour, date.tm_min, date.tm_sec))
            h = date.tm_hour
            output[k]['sum'] += d['value']
            output[k]['hourly'][h] += d['value']

# f = io.open('data.json', 'w', encoding='utf-8') 
# f.write(unicode(json.dumps(output, ensure_ascii=False)))
# f.close()

# json_output=open('data.json')
# output_data = json.load(json_output)
# pprint(output_data)
# json_output.close()