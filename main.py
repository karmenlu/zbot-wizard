from bottle import Bottle, request, response
import openlch
import subprocess
from bottle_cors_plugin import cors_plugin

app = Bottle()

cors = cors_plugin(origins='*')
app.install(cors)

DEFAULT_IP = "192.168.1.1"

@app.post('/start_calibration')
def start_calibration():
    try:
        servo_id = int(request.query.get('servo_id'))
        speed = int(request.query.get('speed', 300))
        current = float(request.query.get('current', 600.0))
        ip = request.query.get('ip', DEFAULT_IP)

        print(f"Received: servo_id={servo_id}, speed={speed}, current={current}, ip={ip}")
        
        hal = openlch.HAL(ip)
        success = hal.servo.start_calibration(
            servo_id, calibration_speed=speed,
            current_threshold=current
        )

        hal.close()

        if success:
            return {
                "status": "success",
                "message": f"Calibration started for servo {servo_id}",
                "details": {
                    "speed": speed,
                    "current_threshold": current
                }
            }
        else:
            response.status = 400
            return {
                "status": "failure",
                "message": f"Failed to start calibration for servo {servo_id}"
            }
        
    except Exception as e:
        response.status = 500
        return {"status": "error", "message": str(e)}


@app.get('/ping')
def ping():
    """
	Ping endpoint to check server status.
	"""
    ip = request.query.get('ip', DEFAULT_IP)
    try:
        result = subprocess.run(["ping", "-c", "1", ip], capture_output=True, text=True, check=False)
        
        if result.returncode == 0:
            response.status = 200
            return {
                "status": "success",
                "message": f"Successfully pinged {ip}",
                "output": result.stdout
            }
        else:
            response.status = 400
            return {
                "status": "failure",
                "message": f"Failed to ping {ip}",
                "output": result.stderr
            }
    except Exception as e:
        response.status = 500
        return {
            "status": "error",
            "message": f"An error occurred while pinging {ip}: {str(e)}"
        }


@app.get('/get_positions')
def get_positions():
    """Get current positions and speeds of all servos."""
    ip = request.query.get('ip', DEFAULT_IP)
    
    try:
        hal = openlch.HAL(ip)
        positions = hal.servo.get_positions()

        result = []
        for servo_id, position, speed in positions:
            result.append({
                "servo_id": servo_id,
                "position": round(position, 2),
                "speed": round(speed, 2)
            })

        hal.close()

        return {
            "status": "success",
            "message": "Current positions and speeds retrieved",
            "data": result
        }

    except Exception as e:
        response.status = 500
        return {
            "status": "error",
            "message": f"An error occurred while retrieving positions: {str(e)}"
        }
    

@app.get('/get_servo_info')
def get_servo_info():
    """Get information about a specific servo."""
    try:
        print(request.query.get('servo_id'))
        servo_id = int(request.query.get('servo_id'))
        ip = request.query.get('ip', DEFAULT_IP)

        print(f"Received: id={servo_id}, ip={ip}")

        hal = openlch.HAL(ip)

        info = hal.servo.get_servo_info(servo_id)

        hal.close()

        return {
            "status": "success",
            "servo_id": servo_id,
            "info": info
        }

    except Exception as e:
        response.status = 500
        return {
            "status": "error",
            "message": f"An error occurred while fetching the servo information: {str(e)}"
        }
    

@app.get('/scan_servos')
def scan_servos():
    """Scan for connected servos."""
    try:
        ip = request.query.get('ip', DEFAULT_IP)

        print(f"Scanning for servos at IP: {ip}")

        hal = openlch.HAL(ip)

        servo_ids = hal.servo.scan()

        hal.close()

        return {
            "status": "success",
            "servo_ids": servo_ids
        }

    except Exception as e:
        response.status = 500
        return {
            "status": "error",
            "message": f"An error occurred while scanning for servos: {str(e)}"
        }
    

@app.post('/change_servo_id')
def change_servo_id():
    """Change the ID of a servo."""
    try:
        old_id = int(request.query.get('old_id'))
        new_id = int(request.query.get('new_id'))
        ip = request.query.get('ip', DEFAULT_IP)

        print(f"Changing servo ID from {old_id} to {new_id} at IP: {ip}")

        hal = openlch.HAL(ip)

        success = hal.servo.change_id(old_id, new_id)

        hal.close()

        if success:
            return {
                "status": "success",
                "message": f"Successfully changed servo ID from {old_id} to {new_id}"
            }
        else:
            response.status = 400
            return {
                "status": "failure",
                "message": "Failed to change servo ID"
            }

    except Exception as e:
        response.status = 500
        return {
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }
    

@app.post('/cancel_calibration')
def cancel_calibration():
    """Cancel ongoing calibration for a specific servo."""
    try:
        servo_id = int(request.query.get('servo_id'))
        ip = request.query.get('ip', DEFAULT_IP)

        print(f"Cancelling calibration for servo {servo_id} at IP: {ip}")

        hal = openlch.HAL(ip)
        success = hal.servo.cancel_calibration(servo_id)
        hal.close()

        if success:
            return {
                "status": "success",
                "message": f"Calibration cancelled for servo {servo_id}"
            }
        else:
            response.status = 400
            return {
                "status": "failure",
                "message": f"Failed to cancel calibration for servo {servo_id}"
            }

    except Exception as e:
        response.status = 500
        return {
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }


@app.get('/get_calibration_status')
def get_calibration_status():
    """Get the current calibration status."""
    try:
        ip = request.query.get('ip', DEFAULT_IP)

        hal = openlch.HAL(ip)
        status = hal.servo.get_calibration_status()
        hal.close()

        if status['is_calibrating']:
            return {
                "status": "success",
                "message": f"Calibration in progress for servo {status['calibrating_servo_id']}"
            }
        else:
            return {
                "status": "success",
                "message": "No calibration in progress"
            }

    except Exception as e:
        response.status = 500
        return {
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }


@app.post('/set_torque')
def set_torque():
    """Set torque for multiple servos."""
    try:
        settings = request.json.get('settings')
        ip = request.json.get('ip', DEFAULT_IP)

        if not settings:
            response.status = 400
            return {"status": "failure", "message": "No settings provided"}

        hal = openlch.HAL(ip)
        hal.servo.set_torque(settings)
        hal.close()

        return {
            "status": "success",
            "message": "Torque settings applied successfully",
            "settings": [{"servo_id": servo_id, "torque": torque} for servo_id, torque in settings]
        }
    except Exception as e:
        response.status = 500
        return {"status": "error", "message": f"An error occurred: {str(e)}"}


@app.post('/set_torque_enable')
def set_torque_enable():
    """Enable or disable torque for multiple servos."""
    try:
        settings = request.json.get('settings')
        ip = request.json.get('ip', DEFAULT_IP)

        if not settings:
            response.status = 400
            return {"status": "failure", "message": "No settings provided"}

        bool_settings = [(id, status.lower() == 'true') for id, status in settings]

        hal = openlch.HAL(ip)
        hal.servo.set_torque_enable(bool_settings)
        hal.close()

        return {
            "status": "success",
            "message": "Torque enable settings applied successfully",
            "settings": [{"servo_id": servo_id, "status": "enabled" if status else "disabled"} for servo_id, status in bool_settings]
        }
    except Exception as e:
        response.status = 500
        return {"status": "error", "message": f"An error occurred: {str(e)}"}


@app.get('/get_imu_data')
def get_imu_data():
    """Get current IMU sensor data (gyroscope and accelerometer readings)."""
    try:
        ip = request.query.get('ip', DEFAULT_IP)

        hal = openlch.HAL(ip)
        imu_data = hal.imu.get_data()
        hal.close()

        return {
            "status": "success",
            "message": "IMU Sensor Data",
            "gyro": imu_data['gyro'],
            "accel": imu_data['accel']
        }
    except Exception as e:
        response.status = 500
        return {"status": "error", "message": f"An error occurred: {str(e)}"}


@app.post('/enable_movement')
def enable_movement():
    """Enable movement for all servos."""
    try:
        ip = request.json.get('ip', DEFAULT_IP)

        hal = openlch.HAL(ip)
        hal.servo.enable_movement()
        hal.close()

        return {"status": "success", "message": "Movement enabled for all servos"}
    except Exception as e:
        response.status = 500
        return {"status": "error", "message": f"An error occurred: {str(e)}"}


@app.post('/disable_movement')
def disable_movement():
    """Disable movement for all servos."""
    try:
        ip = request.json.get('ip', DEFAULT_IP)

        hal = openlch.HAL(ip)
        hal.servo.disable_movement()
        hal.close()

        return {"status": "success", "message": "Movement disabled for all servos"}
    except Exception as e:
        response.status = 500
        return {"status": "error", "message": f"An error occurred: {str(e)}"}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)

