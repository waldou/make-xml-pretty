define(function(require) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone');

	var PretyXmlView = Backbone.View.extend({
		initialize: function(options){
			console.log("Initializing new PretyXmlView...");
			if (!(options && options.model))
				throw new Error("Model is not specified!");
			this.model.on("change:viewType", this.switchView, this);
		},
		events: {
			"click #viewType": "onClickViewType",
			"click #deleteBtn": "onClickDelete",
			"click #downloadBtn": "onClickDownload",
			"click #copyToClipBtn": "onClickCopyToClip"
		},
		onClickViewType: function() {
			var viewType = this.$el.find("#viewType").children('input:checked').val();
			this.model.set("viewType", viewType);
		},
		onClickDelete: function() {
			console.log("Item " + this.model.get("id") + " removed from list...");
			this.model.trigger('destroy', this.model);
			this.$el.hide("fast", function() {
				this.remove();
			});
		},
		onClickDownload: function() {
			try {
				var filename = "prettyXml" + this.model.get("id") + ".xml";
				console.log("Downloading file " + filename + "...");
				var document = this.$el.prop("ownerDocument");
				var text = this.model.get("xmlRaw");
				var element = document.createElement('a');
				element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
				element.setAttribute('download', filename);
				element.style.display = 'none';
				document.body.appendChild(element);
				element.click();
				document.body.removeChild(element);
			} catch(e) {
				console.log("Failed to generate file for download!");
			}
		},
		onClickCopyToClip: function() {
			var document = this.$el.prop("ownerDocument");
			var text = "";
			if(this.model.get("viewType") == "0")
				text = this.$el.find(".prettyXmlText").html();
			else
				text = this.$el.find(".prettyXmlTextRaw").text();
			var success = true, range = document.createRange(), selection;
			if (window.clipboardData) {
				// For IE
				window.clipboardData.setData("Text", text);
			} else {
				var tmpElem = $('<pre style="font-size:0.8em;">');
					tmpElem.css({
					position: "absolute",
					left:     "-1000px",
					top:      "-1000px",
				});
				if(this.model.get("viewType") == "0")
					tmpElem.html(text);
				else
					tmpElem.text(text);
				$("body").append(tmpElem);
				range.selectNodeContents(tmpElem.get(0));
				selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
				try {
					success = document.execCommand ("copy", false, null);
				} catch (e) {
					alert('Failed to copy.');
				}
				if (success) {
					tmpElem.remove();
				}
			}
			if (success) {
				console.log("Text was copied to clipboard...");
			}
		},
		switchView: function() {
			if(this.model.get("viewType") == "0") {
				this.$(".prettyXmlText").show();
				this.$(".prettyXmlTextRaw").hide();
			} else {
				this.$(".prettyXmlText").hide();
				this.$(".prettyXmlTextRaw").show();
			}
		},
		render: function() {
			var template = _.template($("#prettyXmlTemplate").html());
			var html = template(this.model.toJSON());
			$obj = $(html);
			$obj.find(".prettyXmlText").html(this.model.get("xml"));
			$obj.find(".prettyXmlTextRaw").text(this.model.get("xmlRaw"));
			this.$el.append($obj.prop('outerHTML'));
			return this;
		},
	});
	
    return PretyXmlView;
});