# remote
import socket

# s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# s.bind(('',33333))
# s.listen(1)
# conn, addr = s.accept()
# while 1:
#     data = conn.recv(1024)
#     if not data:
#         break
#     conn.sendall(data)
# conn.close()



import socket

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(('73.154.128.39', 33333))

s.sendall(bytes('Hello, world', encoding='utf-8'))

data = s.recv(1024)
s.close()
print(data)
