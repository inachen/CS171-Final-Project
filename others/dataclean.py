# data wrangling
# not used

import csv
import json
import io
import numpy as np
from pprint import pprint

def stations_json():

    stations = np.recfromcsv('dc-stations.csv', delimiter=',')

    output = {'type': "FeatureCollection", 'features':[]}

    for s in stations:

        output['features'].append({
            'type': "Feature",
            "id": np.asscalar(s[0]),
            "geometry": {
                "type":"Point",
                "coordinates":[np.asscalar(s[2]),np.asscalar(s[1])]
            },
            "geometry_name": "origin_geom",
            "properties": {
                'name': s[3]
            }})

    f = io.open('dc-stations.json', 'w', encoding='utf-8') 
    f.write(unicode(json.dumps(output, ensure_ascii=False)))
    f.close()

    json_output=open('dc-stations.json')
    output_data = json.load(json_output)
    pprint(output_data)
    json_output.close()

stations_json()