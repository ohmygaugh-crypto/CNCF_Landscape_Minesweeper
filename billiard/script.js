const canvas = document.getElementById('ballCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Ball {
    constructor(x, y, radius, dx, dy, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx; // velocity in x-direction
        this.dy = dy; // velocity in y-direction
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    update(balls) {
        // Collision detection with walls
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        this.x += this.dx;
        this.y += this.dy;

        // Collision detection with other balls
        for (let i = 0; i < balls.length; i++) {
            if (this !== balls[i]) {
                const dx = this.x - balls[i].x;
                const dy = this.y - balls[i].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.radius + balls[i].radius) {
                    // Simple elastic collision logic
                    let tempDx = this.dx;
                    let tempDy = this.dy;
                    this.dx = balls[i].dx;
                    this.dy = balls[i].dy;
                    balls[i].dx = tempDx;
                    balls[i].dy = tempDy;
                }
            }
        }

        this.draw();
    }
}

const balls = [];
for (let i = 0; i < 20; i++) {
    const radius = Math.random() * 20 + 5;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    const dx = (Math.random() - 0.5) * 4;
    const dy = (Math.random() - 0.5) * 4;
    const color = `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`;
    balls.push(new Ball(x, y, radius, dx, dy, color));
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach(ball => ball.update(balls));
}

animate();
