<!DOCTYPE HTML>
<HTML lang="en">
<head>
	<title>Cross-project Variables</title>
	<meta charset="utf-8">
	<script src="sendtocloud.js"></script>
</head>
<body>
	<div id="wrapper">
		<div id="container">
			<h1>Cross-project Variables</h1>
			<hr style="margin-top: -50px; margin-bottom:30px;">
			<div style="font-size: 15pt; text-align:center; width:75%; margin: 20px auto;">With cloud variables and pure JavaScript, you can transfer values from variables between Scratch projects safely.</div>
			<center>
				<div style="display: block; margin: 0 auto;">
					<div>This will transfer a cloud variable from <a href="https://scratch.mit.edu/projects/178657884/" target="_blank">this project</a> to <a href="https://scratch.mit.edu/projects/178581076/" target="_blank">this project.</a></div>
					<form onsubmit="transferValues(); return false;" style="margin-top:10px;" type="POST">
						<input type="text" id="unameField" placeholder="Scratch Username"></input>
						<input type="submit" value="Transfer values"></input>
					</form>
					<div id="msgDiv" style="margin-top:10px; color:yellow"></div>
				</div>
			</center>
		</div>
	</div>
</body>
</HTML>