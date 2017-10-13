import sublime, sublime_plugin
import os, sys, subprocess, codecs, webbrowser

PLUGIN_FOLDER = os.path.dirname(os.path.realpath(__file__))
USER_FOLDER = os.path.join(sublime.packages_path(), 'User')
SETTINGS_FILE = "VurFormat.sublime-settings"
KEYMAP_FILE = "Default ($PLATFORM).sublime-keymap"

class VueformatCommand(sublime_plugin.TextCommand):
	def run(self, edit):
		self.templateFormat(edit)
		self.styleFormat(edit)
		self.scriptFormat(edit)


	# 格式化html
	def templateFormat(self, edit):
		# 获取起始和结束
		templateStart = self.view.find(r"<template>", 0)
		templateEnd = self.view.find_all(r"</template>")
		# 解决vue中多个template嵌套的问题
		templateEnd = templateEnd[-1]
		if templateStart.begin() < 0:
			return

		# 获取需要格式化的部分
		templateRegion = sublime.Region(templateStart.begin(), templateEnd.end())
		temp_originalBuffer = self.view.substr(templateRegion)
		if len(temp_originalBuffer) > 0:
			# 生成一个临时文件
			temp_file_path, temp_buff = self.save_buffer_to_temp_file(templateRegion, 'html')
			# 格式化之
			formatStr = self.get_temp_file_format(temp_file_path, temp_buff, 'html')
			# 解码
			decodedStr = formatStr.decode("utf-8")
			# 删除临时文件
			os.remove(temp_file_path)
			print('Html part fomatted!')
			# 替换
			self.view.replace(edit, templateRegion, decodedStr[:-1])

	def styleFormat(self, edit):
		styleStart = self.view.find(r"<style(.*)>", 0)
		styleEnd = self.view.find(r"</style>", 0)
		if styleStart.begin() < 0:
			return

		styleRegion = sublime.Region(styleStart.end(), styleEnd.begin())
		style_originalBuffer = self.view.substr(styleRegion)
		if len(style_originalBuffer) > 0:
			temp_file_path, temp_buff = self.save_buffer_to_temp_file(styleRegion, 'css')
			formatStr = self.get_temp_file_format(temp_file_path, temp_buff, 'css')
			decodedStr = formatStr.decode("utf-8")
			os.remove(temp_file_path)
			print('Style part fomatted!')
			self.view.replace(edit, styleRegion, "\n" + decodedStr[:-1])

	def scriptFormat(self, edit):
		scriptStart = self.view.find(r"<script(.*)>", 0)
		scriptEnd = self.view.find(r"</script>", 0)
		if scriptStart.begin() < 0:
			return

		scriptRegion = sublime.Region(scriptStart.end(), scriptEnd.begin())
		script_originalBuffer = self.view.substr(scriptRegion)
		if len(script_originalBuffer) > 0:
			try:
				temp_file_path, temp_buff = self.save_buffer_to_temp_file(scriptRegion, 'js')
				formatStr = self.get_temp_file_format(temp_file_path, temp_buff, 'js')
				decodedStr = formatStr.decode("utf-8")
				self.view.replace(edit, scriptRegion, '\n' + decodedStr[:-1])
				print('Javascript part fomatted!')
			except Exception as e:
				sublime.error_message('Your Javascript Code is Shit!')

	def save_buffer_to_temp_file(self, region, selection_type):
		buffer_text = self.view.substr(region)
		temp_file_name = "temp." + selection_type
		temp_file_path = PLUGIN_FOLDER + "/" + temp_file_name
		f = codecs.open(temp_file_path, mode="w", encoding="utf-8")
		f.write(buffer_text)
		f.close()
		return temp_file_path, buffer_text

	def get_temp_file_format(self, temp_file_path, temp_buff, selection_type):
		node_path = Util.get_node_path()
		# script file
		script_path = PLUGIN_FOLDER + "/scripts/run.js"
		# result file
		file_path = temp_file_path + '.__script__'
		# construct command
		cmd = [node_path, script_path, temp_file_path, file_path or "?", selection_type]

		# exec command
		output = Util.get_output(cmd)

		if len(output) > 1 and output != temp_buff:
			return output
		else:
			return temp_buff

class Util:
	@staticmethod
	def get_pref(key):
		return sublime.load_settings(SETTINGS_FILE).get(key)
	@staticmethod
	def get_node_path():
		platform = sublime.platform()
		node = Util.get_pref("node_path").get(platform)
		print("Using node.js path on '" + platform + "': " + node)
		return node
	@staticmethod
	def get_output(cmd):
		if int(sublime.version()) < 3000:
			if sublime.platform() != "windows":
				# Handle Linux and OS X in Python 2.
				run = '"' + '" "'.join(cmd) + '"'
				return commands.getoutput(run)
			else:
				# Handle Windows in Python 2.
				# Prevent console window from showing.
				startupinfo = subprocess.STARTUPINFO()
				startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
				return subprocess.Popen(cmd, \
					stdout=subprocess.PIPE, \
					startupinfo=startupinfo).communicate()[0]
		else:
			# Handle all OS in Python 3.
			run = '"' + '" "'.join(cmd) + '"'
			return subprocess.check_output(cmd, stderr=subprocess.STDOUT, env=os.environ)
