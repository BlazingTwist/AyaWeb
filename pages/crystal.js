import {useState} from 'react'
import {Button, Checkbox, FormControlLabel, FormGroup, MenuItem, Select, TextField} from "@mui/material";

/**
 * @param {string}name
 * @param {Object<string, any>}paramObj
 */
function makeParamInstance(name, paramObj) {
    let resultParams = [];
    for (let paramName of Object.keys(paramObj)) {
        let initValue = paramObj[paramName];
        resultParams.push({name: paramName, initValue: initValue, valueType: typeof (initValue)});
    }
    return {name: name, params: resultParams};
}

export default function CrystalPanel() {
    const reports = [
        {name: "Invoice", code: "OIDINV"},
        {name: "Feuerwehrliste", code: "FWL"}
    ];

    const reportParams = [
        makeParamInstance("Null", {}),
        makeParamInstance("InvoiceParams", {invoiceOid: ""}),
        makeParamInstance("DateRangeParams", {fromDate: "a", toDate: "b"}),
    ];
    const reportParamsByName = new Map(reportParams.map(x => [x.name, x]));

    const [useFallbackServlet, setUseFallbackServlet] = useState(false);
    const [useNgMode, setUseNgMode] = useState(false);
    const [selectedReport, setSelectedReport] = useState(reports[0].code);
    const [selectedParam, setSelectedParam] = useState(reportParams[0].name);
    const [paramGridContent, setParamGridContent] = useState(null);
    let [paramInput, setParamInput] = useState({});

    function paramToGridEntries(selectedParam) {
        console.log("selectedParam: " + selectedParam)

        let result = [];
        let selectedParamObj = reportParamsByName.get(selectedParam);
        if (!selectedParamObj) {
            return result;
        }

        /**
         * @param {string}paramName
         * @param {React.ChangeEvent<HTMLInputElement>}event
         */
        function handleParamChange(paramName, event) {
            paramInput[paramName] = event.target.value;
            setParamInput(paramInput);
        }

        function makeEntry(paramName, control) {
            return {key: paramName, label: paramName, control: control};
        }

        paramInput = {};
        for (let param of selectedParamObj.params) {
            paramInput[param.name] = param.initValue;
            if (param.valueType === 'object') {
                result.push(makeEntry(
                    param.name,
                    <TextField label="is date" defaultValue={param.initValue} onChange={e => handleParamChange(param.name, e)}/>
                ))
            } else if (param.valueType === 'string') {
                result.push(makeEntry(
                    param.name,
                    <TextField label="is string" defaultValue={param.initValue} onChange={e => handleParamChange(param.name, e)}/>
                ))
            } else {
                result.push(makeEntry(
                    param.name,
                    <TextField label="is unknown" defaultValue={param.initValue} onChange={e => handleParamChange(param.name, e)}/>
                ))
            }
        }
        setParamInput(paramInput);
        return result;
    }

    function onSubmit() {
        console.log("SUBMIT")
        console.log({
            fallback: useFallbackServlet,
            ng: useNgMode,
            report: selectedReport,
            param: selectedParam,
            paramValues: paramInput
        });
    }

    return (
        <div>
            <h2>Crystal Example</h2>

            <FormGroup>
                <FormControlLabel
                    control={<Checkbox checked={useFallbackServlet} onChange={e => setUseFallbackServlet(e.target.checked)}/>}
                    label="use fallback servlet"/>
                <FormControlLabel
                    control={<Checkbox checked={useNgMode} onChange={e => setUseNgMode(e.target.checked)}/>}
                    label="use NG Mode"/>

                <FormControlLabel
                    control={
                        <Select value={selectedReport} onChange={e => setSelectedReport(e.target.value)}>
                            {reports.map(x => <MenuItem key={x.code} value={x.code}>{`${x.name} (${x.code})`}</MenuItem>)}
                        </Select>
                    } label="Report wählen"/>

                <FormControlLabel
                    control={
                        <Select value={selectedParam}
                                onChange={e => {
                                    setSelectedParam(e.target.value)
                                    setParamGridContent(paramToGridEntries(e.target.value))
                                }}>
                            {reportParams.map(x => <MenuItem key={x.name} value={x.name}>{x.name}</MenuItem>)}
                        </Select>
                    } label="Parameter wählen"/>

                {paramGridContent && paramGridContent.map(entry => <FormControlLabel key={entry.label} control={entry.control} label={entry.label}/>)}
            </FormGroup>
            <Button variant="outlined" onClick={onSubmit}>Submit</Button>
        </div>
    );
}