({
	handleSortRequest: function(component, event, helper) {
		var sortParams = event.getParams();
		component.set("v.sortBy", sortParams.SortBy);
		component.set("v.sortAsc", sortParams.SortAsc);
		helper.sort(component, event, helper);
		helper.toggleFilterSpinner(component, component.get("v.spinnerId"), false);
	},

	sort: function(component, event, helper, rows) {
		var sortBy = component.get("v.sortBy");
		if (rows === undefined || rows === null) {
			rows = component.get("v.displayedrows");
		}
		if (null != sortBy) {
			var columns = component.get("v.internalcolumns");
			rows.sort(this.sortComparer(sortBy, 'string', component.get("v.sortAsc")));
			component.set("v.currentpage", 0);
			component.set("v.movetopage", 0);
		}
		component.set("v.displayedrows", rows);
	},

	sortComparer: function(sortBy, dataType, sortAsc) {
		switch(dataType) {
			default: 
				return function (a, b) {
					var x = $A.util.isEmpty(a.datarow[sortBy]) === false ? a.datarow[sortBy] : '';
					var y = $A.util.isEmpty(b.datarow[sortBy]) === false ? b.datarow[sortBy] : '';
					if (x > y)
						return (true === sortAsc) ? 1 : -1;
					if (x < y)
						return (true === sortAsc) ? -1 : 1;
					return 0;
				}
		}
	},

	selectAll: function(component, event, helper) {
		var selected = component.find("selectAll").getElement().checked;
		var rows = component.get("v.displayedrows");
		rows.forEach(function(dr) {
			if (true === dr.rowstatus.Selectable)
				dr.cmeselected = selected;
		});
		component.set("v.displayedrows", rows);
		this.setSelectedList(component);
		var evt = component.getEvent("rowSelected");
		evt.fire();
	},

	datarowsChanged: function(component, event, helper) {
		var datarows = component.get("v.datarows");
		var internaldatarows = [], internalcolumns = [];
		var columns = component.get("v.columns");
		var selectAll = component.get("v.selectAll");
		var selectable = (null == component.get("v.primaryKey") || component.get("v.selectAllDefault") ===  true);
		var q = 0;
		datarows.map(function (dr) {
			var newdr = {datarow: dr, cmeid: q, cmeselected: false, cmeoutputlist: [], rowstatus: {Selectable: selectable, Error: ''}};
			columns.forEach(function (c) {
				var cmeoutput = {config: c, value: dr[c.PropertyName], visible: !(!$A.util.isEmpty(c.Visible) && (c.Visible === false))};
				if (c.Type) {
					switch (c.Type) {
						case 'Datetime' :
							var d = dr[c.PropertyName];
							if ($A.util.isEmpty(d) === false) {
								d = new Date(dr[c.PropertyName]);
								if ('Invalid Date' !== d)
									cmeoutput.value = d;
							}
							break;
						case 'SObjectLink' :
							cmeoutput.value = {RecordId: dr[c.IdField], Text: dr[c.PropertyName]};
							break;
						case 'Currency' :
							cmeoutput.value = {Amount: dr[c.PropertyName] || '', CurrencyCode: (dr[c.CurrencyCodeField] && null != dr[c.CurrencyCodeField]) ? dr[c.CurrencyCodeField] : c.CurrencyCode};
							break;
						case 'ActionGroup' :
						case 'ActionMenu' :
							var cc = JSON.parse(JSON.stringify(c));
							for (let x = 0; x < c.ActionList.length; x++) {
								var validator = c.ActionList[x].DisabledValidator;
								cc.ActionList[x].Validation =  (validator) ? validator(dr) : false;
							}
							cmeoutput.config = cc;
							break;
						default:
							break;
					}
				}
				newdr.cmeoutputlist.push(cmeoutput);
			});
			internaldatarows.push(newdr);
			q++;
		});

		var fo = [],  g=0;
		var textFiltering = component.get("v.filterByText");
		var filterColumnsIndexList = component.get("v.filterColumnsIndexList");
		var filterHeaderList = {visible: [], other: [], get length() { return this.visible.length + this.other.length; }};
		const fl = component.get("v.p_filterlist");
		for(g=0; g < columns.length; g++) {
			if (!(!$A.util.isEmpty(columns[g].Visible) && (columns[g].Visible === false))) {
				columns[g].isFiltered = false;
				internalcolumns.push(columns[g]);
			}
			if (columns[g].Filter && true === columns[g].Filter) {
				var config = columns[g];
				var dateConfig = null, rawData = [];
				var useSortValue = false;
				if (config.Type && config.Type != null && config.Type === 'Datetime') {
					dateConfig = this.getDateConfig(config);
				}
				fo = [];
				internaldatarows.map(function(dr) {
					helper.generateFilterMetadata(dr, g, fo);
				});
				if (config.Type && config.Type === 'Number') {
					fo.sort(function compareNumbers(a, b) {
						var x = $A.util.isEmpty(a.value) === false ? a.value : Number.NEGATIVE_INFINITY;
						var y = $A.util.isEmpty(b.value) === false ? b.value : Number.NEGATIVE_INFINITY;
						return x - y;
					});
				} else if (useSortValue === true) {
					fo.sort(function compareNumbers(a, b) {
						var x = $A.util.isEmpty(a.sortValue) === false ? a.sortValue : new Date(0);
						var y = $A.util.isEmpty(b.sortValue) === false ? b.sortValue : new Date(0);
						if (x > y)
							return 1;
						if (x < y)
							return -1;
						return 0;
					});
				} else {
					fo.sort(function (a, b) {
						var x = a.label;
						var y = b.label;
						if (x > y)
							return 1;
						if (x < y)
							return -1;
						return 0;
					});
				}
				if (columns[g].FilterLocation) {
					switch (columns[g].FilterLocation) {
						case 'header' :
							const type = columns[g].Type || 'Text';
							var sv = [];
							fl.map(function(f) { if (f.field === columns[g].PropertyName) if (!f.value.map) sv.push(f.value); else sv = f.value;})
							const f = {Name: columns[g].PropertyName, Type: type, FilterOptions: fo, DefaultLabel: columns[g].DefaultLabel, Multiple: columns[g].FilterMultiple, SelectedValues: sv};
							const defaultFilters = component.get("v.filterHeadersDefault");
							if ($A.util.isEmpty(defaultFilters) || defaultFilters.indexOf(f.Name) != -1) {
								filterHeaderList.visible.push(f);
							} else {
								filterHeaderList.other.push(f);
							}
							break;
						default: 
							columns[g].FilterLocation = 'column';
							columns[g].FilterOptions = fo;
							break;
					}
				} else {
					columns[g].FilterLocation = 'column';
					columns[g].FilterOptions = fo;
				}
			}
			if (textFiltering === true) {
				if (columns[g].IncludeInTextFilter && columns[g].IncludeInTextFilter === true) {
					filterColumnsIndexList.push(g);
				}
			}
		}
		if (filterColumnsIndexList.length > 0) {
			component.set("v.filterColumnsIndexList", filterColumnsIndexList);
		}
		if (filterHeaderList.length > 0) {
			component.set("v.filterHeaderList", filterHeaderList);
		}

		component.set("v.internalcolumns", internalcolumns);
		component.set("v.internaldatarows", internaldatarows);
	},

	internaldatarowsChanged: function (component, event, helper, idr) {
		if (idr === undefined || idr === null) {
			idr = component.get("v.internaldatarows");
		}
		this.sort(component, event, helper, idr);
		this.filter(component, helper);
		this.setSelectedList(component, idr);
	},

	setSelectedList:function (component, idr) {
		if (idr === undefined || idr === null) {
			idr = component.get("v.displayedrows");
		}
		var selected = [];
		idr.map(function(dr) {
			if (true === dr.cmeselected) {
				selected.push(dr.datarow);
			}
		});
		component.set("v.selectedrows", selected);
	},

	handleRowSelected: function (component, event, helper) {
		var singlemode = !component.get("v.multiSelect");
		if (true === singlemode) {
			var selectedRow = event.getParam("SelectedRow");
			if (null != selectedRow) {
				var rows = component.get("v.displayedrows");
				for (var q = 0; q < rows.length; q++) {
					if (selectedRow.cmeid !== rows[q].cmeid) {
						rows[q].cmeselected = false;
					}
				}
				component.set("v.displayedrows", rows);
			}
			event.setParam("SelectedRow", selectedRow.datarow);
		}
		helper.setSelectedList(component);
		if (false === singlemode)
			component.find("selectAll").getElement().checked = component.get("v.selectedrows").length === component.get("v.datarows").length;
	},

	filter: function(component, helper) {
		const self = this;

		var fl = component.get("v.p_filterlist");
		var rows = component.get("v.internaldatarows");
		var filterColumnsIndexList = null;

		var config = component.get("v.columns");
		var pills = [];
		if (fl.length > 0) {
			fl.map(function(f) {
				switch (f.type) {
					case "Col" :
						if (component.get("v.displayFilterPills")) {
							const column = config.filter(function(c) { return c.PropertyName === f.field; })[0];
							if (f.isExternal === undefined || f.isExternal === false) {
								if (!f.value.map) {
									pills.push(self.generateFilterPill(f.field, f.value, f.value, column));
								} else {
									f.value.map(function(fv) {
										pills.push(self.generateFilterPill(f.field, fv, fv, column));
									});
								}

							}
						}

						rows = rows.filter(function(idr) {
								for(var q=0; q < idr.cmeoutputlist.length; q++) {
									var d = idr.cmeoutputlist[q];
									if (f.field === d.config.PropertyName) {

										var nv = (d.value !== undefined) ? JSON.parse(JSON.stringify(d.value)) : null;
										if (nv && d.value.getYear) {
											nv = d.value;
										}
										const cc = d.value ? d.value.CurrencyCode : null;
										var prop = idr.cmeoutputlist[q].config.PropertyName;
										var proppath = prop.split('.');
										if (proppath.length > 1) {
											nv = [];
											helper.populateValues(nv, idr.datarow[proppath[0]], proppath, 1, idr.cmeoutputlist[q].config, cc);
										}
										//var nv = d.config.FilterOptions;
										if (nv === null) return false;

										if (!nv.map) {
											if (!f.value.map) {
												return helper.testFilterValue(d.config, nv, f.value);
											} else {
												for (var y = 0; y < f.value.length; y++) {
													if (helper.testFilterValue(d.config, nv, f.value[y])) {
														return true;
													}
												}
											}
										} else {
											for (var x = 0; x < nv.length; x++) {
												if (!f.value.map) {
													if (helper.testFilterValue(d.config, nv[x], f.value)) {
														return true;
													}
												} else {
													for (var y = 0; y < f.value.length; y++) {
														if (helper.testFilterValue(d.config, nv[x], f.value[y])) {
															return true;
														}
													}
												}
											}
										}
									} 
								}
								return false;
							});

							component.set("v.filterPills", pills);
						
						break;

					case "Text" :
						rows = rows.filter(function(idr) {
							if (null === filterColumnsIndexList) {
								filterColumnsIndexList = component.get("v.filterColumnsIndexList");
							}
							var match = false;
							for(var q=0; q < filterColumnsIndexList.length; q++) {
								if (idr.cmeoutputlist[filterColumnsIndexList[q]].config.IncludeInTextFilter && true === idr.cmeoutputlist[filterColumnsIndexList[q]].config.IncludeInTextFilter) {
									var data = idr.datarow[idr.cmeoutputlist[filterColumnsIndexList[q]].config.PropertyName];
									match = data && -1 !== String(data).toLowerCase().indexOf(f.value.toLowerCase());
								} 
								if (match === true)
									return match;
							}
							return match;
						});
						break;
					default:
						break;
				}
			});
		} else {
			component.set("v.filterPills", []);
		}
		try { component.set("v.displayedrows", rows); } catch(exc) {/*buttonIcon sometimes throws an exception when being destroyed so just eat it */}

		helper.toggleFilterSpinner(component, component.get("v.spinnerId"), false);
	},

	processExternalFilter: function(component, filterOptions) {
		filterOptions.map(function(f) { f.isExternal = true; });
		this.processFilter(component, filterOptions);
	},

	processFilter: function(component, filterOptions) {
		var fl = component.get("v.p_filterlist");
		if (filterOptions.map === undefined) {
			filterOptions = [filterOptions];
		}

		filterOptions.map(function(fo) {
			for (var x = 0; x < fl.length; x++) {
				if (fl[x].field === fo.column) {
					fl.splice(x, 1);
					break;
				}
			}
			if ((fo.value.map !== undefined) ? fo.value.length !== 0 : "All" !== fo.value) {
				fl.push({type: 'Col', field: fo.column, value: fo.value, isExternal: fo.isExternal});
			}
		});
		component.set("v.p_filterlist", fl);
	},

	updateSelectable: function(component, event, handler) {
		var pk = component.get("v.primaryKey");

		if (null != pk) {
			var rsl = event.getParam("arguments").RowStatusList;
			var datarows = component.get("v.displayedrows");
			for(var a = 0; a < rsl.length; a++) {
				for(var b = 0; b < datarows.length; b++) {
					if (datarows[b].datarow[pk] === rsl[a].PrimaryKey) {
						if (false === rsl[a].Selectable)
							datarows[b].cmeselected = false;
						datarows[b].rowstatus.Selectable = rsl[a].Selectable;
						datarows[b].rowstatus.Error = rsl[a].Error;
						break;
					}
				}
			}
			component.set("v.displayedrows", datarows);
		}
	},

	initPaging: function(component) {
		var pageSize = parseInt(component.get("v.pageSize"));
		var displayedrows = component.get("v.displayedrows");
		var pagedrows = displayedrows, pages = [displayedrows];
		if (displayedrows.length > pageSize) {
			var pages = [];
			var x = 0;
			while(x < displayedrows.length) {
				var page = displayedrows.slice(x, x + pageSize);
				pages.push(page);
				x += pageSize
			}
			pagedrows = pages[0];
			pages = pages;
		}
		component.set("v.pages", pages);
		component.set("v.currentpage", 0);
		component.set("v.movetopage", 0);
		try {
			component.set("v.pagedrows", pagedrows);
		} catch (e) { /*buttonIcon throws exception, just eat it */}
	},

	setPaging: function(component, helper) {
		console.log("Set paging: " + Date.now());
		var movetopage = component.get("v.movetopage");
		component.set("v.currentpage", movetopage);

		try {
			component.set("v.pagedrows", component.get("v.pages")[movetopage]);
		} catch (e) { /*buttonIcon throws exception, just eat it */}

		helper.toggleFilterSpinner(component, component.get("v.spinnerId"), false);
		console.log("End paging: " + Date.now());
	},

	toggleFilterSpinner: function(component, id, show) {
		//using native DOM seems to be a bit faster than using lightning methods
		var w = document.getElementById(id);
		if (w)
			w.className= (show === true) ? "" : "cme-datagrid-hidden";
	},

	detectContainer: function(component) {
		const isSFOne = !$A.util.isEmpty($A.get(component.get("v.sfOneAppDetectEvent")));
		console.log('isSFOne: ' + isSFOne);
		component.set("v.isSFOne", isSFOne);
	},

	getDateConfig: function(config) {
		if (config.Format) {
			return { 
						year: config.Format.Year, month: config.Format.Month, day: config.Format.Day
						, hour: config.Format.Hour, hour12: config.Format.Hour12, minute: config.Format.Minute, second: config.Format.Second
						, weekday: config.Format.Weekday
						, timeZone: config.Format.TimeZone, timeZoneName: config.Format.TimeZoneName
					};
		}
		return {};
	},

	populateValues: function(arr, o, proppath, i, c, cc) {
		const self = this;
		if (!$A.util.isEmpty(o)) {
			if (o.map) {
				o.map(function(r) {
					self.populateValues(arr, r, proppath, i, c, cc);
				});
			} else if (typeof o !== "object") {
				if (c.Type === 'Currency') {
					arr.push({Amount: o, CurrencyCode: cc});
				} else {
					arr.push(o);
				}
			} else {
				if (o.getYear) {
					arr.push(o);
				} else {
					self.populateValues(arr, o[proppath[i]], proppath, i+1, c, cc);
				}
			}
		}
	},

	updateFilter: function(component, filtername, filtervalue) {
		var filters = component.get("v.p_filterlist");
		var thisfilter = null;
		for(let x=0; x<filters.length; x++) {
			if (filters[x].field === filtername) {
				thisfilter = filters[x];
				thisfilter.column = thisfilter.field;
				//if value is not a list, set it to 'All'
				//if value is list, remove value from list. set value = updated list or All (if empty list)
				if (!thisfilter.value.map) {
					thisfilter.value = "All";
				} else {
					for (let y = 0; y < thisfilter.value.length; y++) {
						if (thisfilter.value[y] === filtervalue) {
							thisfilter.value.splice(y, 1);
							break;
						}
					}
					if (thisfilter.value.length === 0) {
						thisfilter.value = "All";
					}
				}
				break;
			}
		}

		this.processFilter(component, thisfilter);

		//reset header filter selection UI

		const hdrfltrs = component.get("v.filterHeaderList");

		var foundhdr = this.removeFilter(hdrfltrs.visible, filtername, filtervalue);
		if (!foundhdr) {
			foundhdr = this.removeFilter(hdrfltrs.other, filtername, filtervalue);
		}

		if (foundhdr) {
			component.set("v.filterHeaderList", hdrfltrs);
		} else {
			//check column filters
			const cols = component.get("v.internalcolumns");
			for (let x=0; x<cols.length; x++) {
				if (cols[x].PropertyName === filtername) {
					cols[x].isFiltered = false;
					break;
				}
			}
			component.set("v.internalcolumns", cols);
		}
	},

	removeFilter: function(list, name, value) {
		for(let x=0; x<list.length; x++) {
			if (list[x].Name === name) {
				list[x].SelectedValues.splice(list[x].SelectedValues.indexOf(value), 1);
				return true;
			}
		}
		return false;
	},

	generateFilterPill: function (field, label, value, column) {
		var filterPillData = {field: field, label: label, value: value, icon: column.FilterPillIcon};
		if (column.Type === 'Checkbox' || column.Type === 'BooleanIcon') {
			filterPillData.label = (value == true || value == 'true') ? column.TrueLabel || true : column.FalseLabel || false;
		} else if (column.Type === 'SObjectLink') {
		} else if (column.Type === 'Datetime') {
			filterPillData.label = value.toLocaleString(undefined, this.getDateConfig(column));
		} else if (column.Type === 'Number') {
		} else if (column.Type === 'Currency') {
			//return !($A.util.isEmpty(datavalue) || $A.util.isEmpty(datavalue.Amount)) ?  ((datavalue.Amount.toLocaleString) ? datavalue.Amount.toLocaleString(undefined, {style: 'currency', currency: datavalue.CurrencyCode}) : '') === filtervalue : false;
		}

		return {
			type: ($A.util.isEmpty(filterPillData.icon)) ? null : 'icon',
			label: filterPillData.label,
			iconName: filterPillData.icon,
			alternativeText: filterPillData.label,
			name: filterPillData.field + '|' + filterPillData.value
		};
	},

	testFilterValue: function(config, datavalue, filtervalue) {
		if (config.Type === 'Checkbox' || config.Type === 'BooleanIcon') {	// && d.config.TrueLabel
			return datavalue.toString() === filtervalue.toString();
		} else if (config.Type === 'SObjectLink') {
			return datavalue.Text === filtervalue;
		} else if (config.Type === 'Datetime') {
			return (datavalue) ?  datavalue.toUTCString() === ((filtervalue.toUTCString) ? filtervalue.toUTCString() : filtervalue) : false;
		} else if (config.Type === 'Number') {
			return (datavalue) ?  Number(datavalue) === Number(filtervalue) : false;
		} else if (config.Type === 'Currency') {
			return !($A.util.isEmpty(datavalue) || $A.util.isEmpty(datavalue.Amount)) ?  ((datavalue.Amount.toLocaleString) ? datavalue.Amount.toLocaleString(undefined, {style: 'currency', currency: datavalue.CurrencyCode}) : '') === filtervalue : false;
		} else {
			return datavalue === filtervalue;
		}
	},

	generateFilterOptions: function(v, config, fo) {
		if ((config.Type === 'Checkbox' || config.Type === 'BooleanIcon') && config.TrueLabel) {
			var label = v === true ? config.TrueLabel : config.FalseLabel;
			var opt = fo.filter(function (o) {
				return o.label == label;
			});
			if (opt.length == 0) {
				v = {label: label, value: v};
				fo.push(v);
			}
			return;
		}
		if (config.Type === 'Currency') {
			useSortValue = true;
			let cv = (v.Amount) ? v.Amount.toLocaleString(undefined, {style: 'currency', currency: v.CurrencyCode}) : '';
			if (-1 === rawData.indexOf(cv)) {
				v = {label: cv, value: cv, sortValue: v.Amount};
				fo.push(v);
				rawData.push(cv);
			}
			return;
		}
		if (config.Type === 'SObjectLink') {
			v = v.Text;
		}
		if (config.Type === 'Datetime') {
			var dateConfig = this.getDateConfig(config);
			useSortValue = true;
			if (v) {
				var label = v.toLocaleString(undefined, dateConfig);
				if (-1 === rawData.indexOf(label)) {
					v = {label: label, value: v.toUTCString(), sortValue: v};
					fo.push(v);
					rawData.push(label);
				}
				return;
			}
		}
		var opt = fo.filter(function (o) {
			return o.label == v;
		});
		if (opt.length == 0) {
			v = {label: v, value: v};
			fo.push(v);
		}
		return;
	},

	generateFilterMetadata: function(dr, g, fo) {
		const self = this;
		var v = dr.cmeoutputlist[g].value;
		if ($A.util.isEmpty(v) || (dr.cmeoutputlist[g].config.Type === 'Currency' && v.Amount === '')) {
			const cc = v ? v.CurrencyCode : null;
			var prop = dr.cmeoutputlist[g].config.PropertyName;
			var proppath = prop.split('.');
			if (proppath.length > 1) {
				v = [];
				self.populateValues(v, dr.datarow[proppath[0]], proppath, 1, dr.cmeoutputlist[g].config, cc);
				//TODO: save these here per row so we dont have to recalculate them in the filter process
				//dr.cmeoutputlist[g].config.FilterOptions = v;
			}
		}
		if (!$A.util.isEmpty(v)) {
			if (!v.map) {
				self.generateFilterOptions(v, dr.cmeoutputlist[g].config, fo);
			} else {
				v.map(function(v) { 
					self.generateFilterOptions(v, dr.cmeoutputlist[g].config, fo);
				});
			}
		}
	}
})