/*
	User script to customise the Concourse pipeline view:
  - adds version number to each job
	- adds link to view pipeline config

	Works best with pipelines created by halfpipe.
*/

function annotatePlan() {
	let jobsUrl = window.location.href.replace('.io/', '.io/api/v1/') + '/jobs';
	fetch(jobsUrl).then(function (response) {
		return response.json();
	}).then(function (stages) {
		const stageElements = document.querySelectorAll('.node.job');

		stages.forEach((stage, i) => {
			var build = stage.next_build || stage.finished_build
			if (!build || stageElements[i].hasAnnotation) {
				return;
			}
			const resourcesUrl = `${window.location.origin}/${build.api_url}/resources`;
			return fetch(resourcesUrl)
				.then(x => x.json())
				.then(resources => {
					const versionInput = resources.inputs.filter(x => x.type === 'semver' && x.name === "version");
					if (versionInput.length === 0) {
						return;
					}

					const message = versionInput[0].version.number;
					stageElements[i].innerHTML += `<text x="1" y="6" style="font-size:60%">${message}</text>`;
					stageElements[i].hasAnnotation = true;
				});
		});
	});
}

function addConfigLink() {
	let configUrl = window.location.href.replace('.io/', '.io/api/v1/') + '/config';
	var cell = document.querySelector("table.lower-right-info").insertRow(-1).insertCell(0);
	cell.colSpan = 2;
	cell.innerHTML = `<a href="${configUrl}">pipeline config</a>`;
}

if (window.location.href.indexOf('/pipelines/') !== -1) {
	const intervalId = setInterval(() => {
		const svg = document.querySelector('svg.pipeline-graph');
		if (svg) {
			addConfigLink();
			const observer = new MutationObserver(annotatePlan);
			observer.observe(svg, {attributes: true, childList: false, subtree: false});
			clearInterval(intervalId);
		}
	}, 50);
}
