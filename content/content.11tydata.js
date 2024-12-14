export default {
	layout: "layouts/page.njk",
	eleventyComputed: {
		title: (data) => data.page.filePathStem.split('/').pop(),
	},
};
