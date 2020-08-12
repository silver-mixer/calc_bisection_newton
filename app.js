document.addEventListener('DOMContentLoaded', () => {
	let bisectionUI = new BisectionUI(
		document.getElementById('bisection_graph'),
		document.getElementById('bisection_a'),
		document.getElementById('bisection_b'),
		document.getElementById('bisection_times'),
		document.getElementById('bisection_a_now'),
		document.getElementById('bisection_b_now'),
		document.getElementById('bisection_c_now'),
		document.getElementById('bisection_ab_diff'),
		document.getElementById('bisection_step'),
		document.getElementById('bisection_reset')
	);
	let newtonUI = new NewtonUI(
		document.getElementById('newton_graph'),
		document.getElementById('newton_a'),
		document.getElementById('newton_times'),
		document.getElementById('newton_a_now'),
		document.getElementById('newton_b_now'),
		document.getElementById('newton_ab_diff'),
		document.getElementById('newton_step'),
		document.getElementById('newton_reset')
	);
});

class BisectionUI{
	constructor(canvas, a, b, times, aNow, bNow, cNow, abDiff, step, reset){
		this.cvs = canvas;
		this.a = a;
		this.b = b;
		this.times = times;
		this.aNow = aNow;
		this.bNow = bNow;
		this.cNow = cNow;
		this.abDiff = abDiff;
		this.step = step;
		this.reset = reset;
		this.ctx = this.cvs.getContext('2d');
		this.stepCount = 0;
		this.extend = 50;
		this.offsetX = 0;
		this.offsetY = 0;
		this.isDrag = false;
		this.dragX = 0;
		this.dragY = 0;
		this.bisection = new Bisection(Number(this.a.value), Number(this.b.value));
		this.aNow.innerText = this.bisection.getA();
		this.bNow.innerText = this.bisection.getB();
		this.cNow.innerText = this.bisection.getC();
		this.abDiff.innerText = Math.abs(this.bisection.getA() - this.bisection.getB());
		this.drawAll();
		this.cvs.addEventListener('mousewheel', event => {
			event.preventDefault();
			if(event.deltaY > 0 && this.extend - 10 > 0){
				this.extend -= 10;
			}else if(event.deltaY < 0){
				this.extend += 10;
			}
			this.drawAll();
		});
		this.cvs.addEventListener('mousedown', event => {
			let rect = this.cvs.getBoundingClientRect();
			this.dragX = event.clientX - rect.left;
			this.dragY = event.clientY - rect.top;
			this.isDrag = true;
		});
		this.cvs.addEventListener('mousemove', event => {
			if(!this.isDrag)return;
			let rect = this.cvs.getBoundingClientRect();
			let tempDragX = event.clientX - rect.left;
			let tempDragY = event.clientY - rect.top;
			this.offsetX += this.dragX - tempDragX;
			this.offsetY -= this.dragY - tempDragY;
			this.dragX = tempDragX;
			this.dragY = tempDragY;
			this.drawAll();
		});
		this.cvs.addEventListener('mouseup', event => {
			this.isDrag = false;
		});
		this.a.addEventListener('change', () => {
			this.bisection.setA(Number(this.a.value));
			this.aNow.innerText = this.bisection.getA();
			this.cNow.innerText = this.bisection.getC();
			this.drawAll();
		});
		this.b.addEventListener('change', () => {
			this.bisection.setB(Number(this.b.value));
			this.aNow.innerText = this.bisection.getA();
			this.bNow.innerText = this.bisection.getB();
			this.drawAll();
		});
		this.step.addEventListener('click', () => {
			this.bisection.step();
			this.times.innerText = ++this.stepCount;
			this.aNow.innerText = this.bisection.getA();
			this.bNow.innerText = this.bisection.getB();
			this.cNow.innerText = this.bisection.getC();
			this.abDiff.innerText = Math.abs(this.bisection.getA() - this.bisection.getB());
			this.drawAll();
		});
		this.reset.addEventListener('click', () => {
			this.bisection.setA(Number(this.a.value));
			this.bisection.setB(Number(this.b.value));
			this.stepCount = 0;
			this.times.innerText = 0;
			this.aNow.innerText = this.bisection.getA();
			this.bNow.innerText = this.bisection.getB();
			this.cNow.innerText = this.bisection.getC();
			this.abDiff.innerText = Math.abs(this.bisection.getA() - this.bisection.getB());
			this.drawAll();
		});
	}
	drawAll(){
		this.clearCanvas();
		this.drawGrid();
		this.drawAxis();
		this.drawGraph();
		this.drawAB();
	}
	drawGrid(){
		this.ctx.strokeStyle = 'lightgray';
		this.ctx.beginPath();
		for(let y = 0; y < this.cvs.height / this.extend; y++){
			this.ctx.moveTo(0, this.extend * y + this.offsetY % this.extend + this.cvs.height / 2 % this.extend);
			this.ctx.lineTo(this.cvs.width, this.extend * y + this.offsetY % this.extend + this.cvs.height / 2 % this.extend);
		}
		for(let x = 0; x < this.cvs.width / this.extend; x++){
			this.ctx.moveTo(this.extend * x - this.offsetX % this.extend + this.cvs.width / 2 % this.extend, 0);
			this.ctx.lineTo(this.extend * x - this.offsetX % this.extend + this.cvs.width / 2 % this.extend, this.cvs.height);
		}
		this.ctx.stroke();
	}
	drawAxis(){
		this.ctx.strokeStyle = 'black';
		this.ctx.beginPath();
		this.ctx.moveTo(0, this.cvs.height / 2 + this.offsetY);
		this.ctx.lineTo(this.cvs.width, this.cvs.height / 2 + this.offsetY);
		this.ctx.moveTo(this.cvs.width / 2 - this.offsetX, 0);
		this.ctx.lineTo(this.cvs.width / 2 - this.offsetX, this.cvs.height);
		this.ctx.stroke();
	}
	drawGraph(){
		this.ctx.strokeStyle = 'green';
		this.ctx.beginPath();
		this.ctx.moveTo(-this.cvs.width / 2 - this.offsetX, this.cvs.height / 2 + -this.bisection.funcY(0) * this.extend + this.offsetY);
		for(let x = -this.cvs.width / 2; x < this.cvs.width; x++){
			this.ctx.lineTo(this.cvs.width / 2 + x - this.offsetX, this.cvs.height / 2 - this.bisection.funcY(x * 1 / this.extend) * this.extend + this.offsetY);
		}
		this.ctx.stroke();
	}
	drawAB(){
		this.ctx.strokeStyle = 'blue';
		this.ctx.beginPath();
		this.ctx.moveTo(this.cvs.width / 2 + this.bisection.getA() * this.extend - this.offsetX, 0);
		this.ctx.lineTo(this.cvs.width / 2 + this.bisection.getA() * this.extend - this.offsetX, this.cvs.height);
		this.ctx.moveTo(this.cvs.width / 2 + this.bisection.getB() * this.extend - this.offsetX, 0);
		this.ctx.lineTo(this.cvs.width / 2 + this.bisection.getB() * this.extend - this.offsetX, this.cvs.height);
		this.ctx.stroke();
		this.ctx.strokeStyle = 'red';
		this.ctx.beginPath();
		this.ctx.moveTo(this.cvs.width / 2 + this.bisection.getC() * this.extend - this.offsetX, 0);
		this.ctx.lineTo(this.cvs.width / 2 + this.bisection.getC() * this.extend - this.offsetX, this.cvs.height);
		this.ctx.stroke();
	}
	clearCanvas(){
		this.ctx.fillStyle = 'white';
		this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
	}
}

class Bisection{
	constructor(a, b){
		this.a = a;
		this.b = b;
	}
	setA(a){
		this.a = a;
	}
	getA(){
		return this.a;
	}
	setB(b){
		this.b = b;
	}
	getB(){
		return this.b;
	}
	getC(){
		return (this.a + this.b) / 2;
	}
	step(){
		let c = (this.a + this.b) / 2;
		if(this.funcY(c) * this.funcY(this.a) < 0){
			this.b = c;
		}else{
			this.a = c;
		}
	}
	funcY(x){
		return Math.pow(x, 3) + x - 1;
	}
}

class NewtonUI{
	constructor(canvas, a, times, aNow, bNow, abDiff, step, reset){
		this.cvs = canvas;
		this.a = a;
		this.times = times;
		this.aNow = aNow;
		this.bNow = bNow;
		this.abDiff = abDiff;
		this.step = step;
		this.reset = reset;
		this.step = step;
		this.ctx = this.cvs.getContext('2d');
		this.stepCount = 0;
		this.extend = 50;
		this.offsetX = 0;
		this.offsetY = 0;
		this.isDrag = false;
		this.dragX = 0;
		this.dragY = 0;
		this.newton = new Newton(Number(this.a.value));
		this.aNow.innerText = this.newton.getA();
		this.bNow.innerText = this.newton.getB();
		this.abDiff.innerText = Math.abs(this.newton.getA() - this.newton.getB());
		this.drawAll();
		this.cvs.addEventListener('mousewheel', event => {
			event.preventDefault();
			if(event.deltaY > 0 && this.extend - 10 > 0){
				this.extend -= 10;
			}else if(event.deltaY < 0){
				this.extend += 10;
			}
			this.drawAll();
		});
		this.cvs.addEventListener('mousedown', event => {
			let rect = this.cvs.getBoundingClientRect();
			this.dragX = event.clientX - rect.left;
			this.dragY = event.clientY - rect.top;
			this.isDrag = true;
		});
		this.cvs.addEventListener('mousemove', event => {
			if(!this.isDrag)return;
			let rect = this.cvs.getBoundingClientRect();
			let tempDragX = event.clientX - rect.left;
			let tempDragY = event.clientY - rect.top;
			this.offsetX += this.dragX - tempDragX;
			this.offsetY -= this.dragY - tempDragY;
			this.dragX = tempDragX;
			this.dragY = tempDragY;
			this.drawAll();
		});
		this.cvs.addEventListener('mouseup', event => {
			this.isDrag = false;
		});
		this.a.addEventListener('change', () => {
			this.newton.setA(Number(this.a.value));
			this.aNow.innerText = this.newton.getA();
			this.bNow.innerText = this.newton.getB();
			this.drawAll();
		});
		this.step.addEventListener('click', () => {
			this.newton.step();
			this.times.innerText = ++this.stepCount;
			this.aNow.innerText = this.newton.getA();
			this.bNow.innerText = this.newton.getB();
			this.abDiff.innerText = Math.abs(this.newton.getA() - this.newton.getB());
			this.drawAll();
		});
		this.reset.addEventListener('click', () => {
			this.newton.setA(Number(this.a.value));
			this.stepCount = 0;
			this.times.innerText = 0;
			this.aNow.innerText = this.newton.getA();
			this.bNow.innerText = this.newton.getB();
			this.abDiff.innerText = Math.abs(this.newton.getA() - this.newton.getB());
			this.drawAll();
		});
	}
	drawAll(){
		this.clearCanvas();
		this.drawGrid();
		this.drawAxis();
		this.drawGraph();
		this.drawA();
	}
	drawGrid(){
		this.ctx.strokeStyle = 'lightgray';
		this.ctx.beginPath();
		for(let y = 0; y < this.cvs.height / this.extend; y++){
			this.ctx.moveTo(0, this.extend * y + this.offsetY % this.extend + this.cvs.height / 2 % this.extend);
			this.ctx.lineTo(this.cvs.width, this.extend * y + this.offsetY % this.extend + this.cvs.height / 2 % this.extend);
		}
		for(let x = 0; x < this.cvs.width / this.extend; x++){
			this.ctx.moveTo(this.extend * x - this.offsetX % this.extend + this.cvs.width / 2 % this.extend, 0);
			this.ctx.lineTo(this.extend * x - this.offsetX % this.extend + this.cvs.width / 2 % this.extend, this.cvs.height);
		}
		this.ctx.stroke();
	}
	drawAxis(){
		this.ctx.strokeStyle = 'black';
		this.ctx.beginPath();
		this.ctx.moveTo(0, this.cvs.height / 2 + this.offsetY);
		this.ctx.lineTo(this.cvs.width, this.cvs.height / 2 + this.offsetY);
		this.ctx.moveTo(this.cvs.width / 2 - this.offsetX, 0);
		this.ctx.lineTo(this.cvs.width / 2 - this.offsetX, this.cvs.height);
		this.ctx.stroke();
	}
	drawGraph(){
		this.ctx.strokeStyle = 'green';
		this.ctx.beginPath();
		this.ctx.moveTo(-this.cvs.width / 2 - this.offsetX, this.cvs.height / 2 + -this.newton.funcY(0) * this.extend + this.offsetY);
		for(let x = -this.cvs.width / 2; x < this.cvs.width; x++){
			this.ctx.lineTo(this.cvs.width / 2 + x - this.offsetX, this.cvs.height / 2 - this.newton.funcY(x * 1 / this.extend) * this.extend + this.offsetY);
		}
		this.ctx.stroke();
	}
	drawA(){
		this.ctx.strokeStyle = 'blue';
		this.ctx.beginPath();
		this.ctx.moveTo(this.cvs.width / 2 + this.newton.getA() * this.extend - this.offsetX, 0);
		this.ctx.lineTo(this.cvs.width / 2 + this.newton.getA() * this.extend - this.offsetX, this.cvs.height);
		this.ctx.stroke();
		this.ctx.strokeStyle = 'red';
		this.ctx.beginPath();
		this.ctx.moveTo(this.cvs.width / 2 + this.newton.getB() * this.extend - this.offsetX, this.cvs.height / 2 + this.offsetY);
		this.ctx.lineTo(this.cvs.width / 2 + this.newton.getA() * this.extend - this.offsetX, this.cvs.height / 2 - this.newton.funcY(this.newton.getA()) * this.extend + this.offsetY);
		this.ctx.stroke();
		this.ctx.fillStyle = 'red';
		this.ctx.fillRect(
			this.cvs.width / 2 + this.newton.getA() * this.extend - this.offsetX - 3,
			this.cvs.height / 2 - this.newton.funcY(this.newton.getA()) * this.extend + this.offsetY - 3,
			6, 6
		);
		this.ctx.fillRect(
			this.cvs.width / 2 + this.newton.getB() * this.extend - this.offsetX - 3,
			this.cvs.height / 2 + this.offsetY - 3,
			6, 6
		);
	}
	clearCanvas(){
		this.ctx.fillStyle = 'white';
		this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
	}
}

class Newton{
	constructor(a){
		this.a = a;
	}
	setA(a){
		this.a = a;
	}
	getA(){
		return this.a;
	}
	getB(){
		return this.a - this.funcY(this.a) / this.funcZ(this.a);
	}
	step(){
		this.a = this.getB();
	}
	funcY(x){
		return Math.pow(x, 3) + x - 1;
	}
	funcZ(x){
		return Math.pow(x, 2) + 1;
	}
}