VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Befunge"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False

Private src As Worksheet, stack As Worksheet, run As Worksheet, translate As Worksheet
Private x_pos As Integer, y_pos As Integer, direction As Integer
Private str_mode As Boolean
Private stack_size As Integer
Private translate_size As Integer
Private step_count As Integer

Public Sub Class_Initialize()
    Application.ScreenUpdating = False

    Set src = Worksheets("src")
    Set stack = Worksheets("stack")
    Set run = Worksheets("run")
    Set translate = Worksheets("translate")
    x_pos = 1
    y_pos = 1
    direction = 6
    str_mode = False
    stack_size = 0
    translate_size = 0
    step_count = 0
    
    run.Select
    run.Cells.Select
    Selection.ClearContents
    Selection.NumberFormatLocal = "@"
    run.Cells(1, 1).Select
    
    stack.Select
    stack.Cells.Select
    Selection.ClearContents
    Selection.NumberFormatLocal = "@"
    stack.Cells(1, 1).Select
    
    translate.Select
    translate.Cells.Select
    Selection.ClearContents
    Selection.NumberFormatLocal = "@"
    translate.Cells(1, 1).Select
    
    translate_add ("mes """"")
    translate_add ("mesx = 0")
    
    For x = 1 To 100
        For y = 1 To 100
            run.Cells(y, x).Value = src.Cells(y, x).Value
            run.Cells(y, x).Interior.Color = &HFFFFFF
        Next y
    Next x
    
    Application.ScreenUpdating = True
End Sub

Private Function stack_pop() As String()
    Dim ret(1) As String
    ret(0) = ""
    ret(1) = ""
    If stack_size >= 1 Then
        ret(0) = stack.Cells(stack_size, 1)
        ret(1) = stack.Cells(stack_size, 2)
        stack.Cells(stack_size, 1) = ""
        stack.Cells(stack_size, 2) = ""
        stack_size = stack_size - 1
    End If
    stack_pop = ret
End Function

Private Sub stack_push(val As String)
    stack_size = stack_size + 1
    stack.Cells(stack_size, 1) = val
    stack.Cells(stack_size, 2) = translate_var_getname_fromstack
End Sub

Private Sub translate_add(val As String)
    translate_size = translate_size + 1
    translate.Cells(translate_size, 1) = val
    Debug.Print val
End Sub

Private Sub translate_variable_set(val As String)
    stack.Cells(stack_size, 2).Text = val
End Sub

Private Sub translate_variable_setsrc(x As Integer, y As Integer)
    stack.Cells(y, x + 3).Value = "1"
End Sub

Private Function translate_var_getname_fromstack() As String
    translate_var_getname_fromstack = "var" & step_count & stack_size
End Function

Private Function translate_var_getname_fromsrc(x As Integer, y As Integer, name) As String
    If stack.Cells(y, x + 3).Text = "1" Then
        name = "varp" & x & y
    Else
        name = ""
    End If
End Function

Private Function translate_indent()
    translate_indent = "    "
End Function

Public Function step() As Boolean
    Dim v As String
    v = run.Cells(y_pos, x_pos)
    
    '' parse
    Dim tmp_x, tmp_y, tmp_v
    Dim tmp_ta, tmp_tb, tmp_tc As String
    
    '' string mode
    If str_mode Then
        If v = """" Then
            str_mode = False
        Else
            If v = "" Then
                v = " "
            End If
            stack_push (Asc(v))
            translate_add (translate_var_getname_fromstack & " = " & Asc(v))
        End If
        
    '' exit
    ElseIf v = "@" Then
        translate_add ("stop")
        step = False
        Exit Function
    
    '' literal
    ElseIf v >= "0" And v <= "9" Then
        stack_push (v)
        translate_add (translate_var_getname_fromstack & " = " & v)
        
    ElseIf v = """" Then
        str_mode = True
        
    '' IO
    ElseIf v = "." Then
        tmp_v = stack_pop()
        translate_add ("mesx = mesx + ginfo_mesx")
        translate_add ("pos mesx,0")
        translate_add ("mes """"+" & tmp_v(1) & "+"" """)
        
    ElseIf v = "," Then
        tmp_v = stack_pop()
        translate_add ("mesx = mesx + ginfo_mesx")
        translate_add ("pos mesx,0")
        translate_add ("dammy = ""a""")
        translate_add ("poke dammy, 0, " & tmp_v(1))
        translate_add ("mes dammy")
    
    '' calc
    ElseIf v = "+" Then
        tmp_y = stack_pop()
        tmp_x = stack_pop()
        tmp_v = tmp_x(0) + tmp_y(0)
        stack_push (tmp_v)
        translate_add (translate_var_getname_fromstack & " = " & tmp_x(1) & " + " & tmp_y(1))
    ElseIf v = "-" Then
        tmp_y = stack_pop()
        tmp_x = stack_pop()
        tmp_v = tmp_x(0) - tmp_y(0)
        stack_push (tmp_v)
        translate_add (translate_var_getname_fromstack & " = " & tmp_x(1) & " - " & tmp_y(1))
    ElseIf v = "*" Then
        tmp_y = stack_pop()
        tmp_x = stack_pop()
        tmp_v = tmp_x(0) * tmp_y(0)
        stack_push (tmp_v)
        translate_add (translate_var_getname_fromstack & " = " & tmp_x(1) & " * " & tmp_y(1))
    ElseIf v = "/" Then
        tmp_y = stack_pop()
        tmp_x = stack_pop()
        tmp_v = tmp_x(0) / tmp_y(0)
        stack_push (tmp_v)
        translate_add (translate_var_getname_fromstack & " = " & tmp_x(1) & " / " & tmp_y(1))
    ElseIf v = "%" Then
        tmp_y = stack_pop()
        tmp_x = stack_pop()
        tmp_v = tmp_x(0) Mod tmp_y(0)
        stack_push (tmp_v)
        translate_add (translate_var_getname_fromstack & " = " & tmp_x(1) & " \ " & tmp_y(1))

    ElseIf v = "`" Then
        tmp_y = stack_pop()
        tmp_x = stack_pop()
        tmp_v = IIf(tmp_x(0) > tmp_y(0), 1, 0)
        stack_push (tmp_v)
        translate_add ("if " & tmp_x(1) & " > " & tmp_y(1) & " { ")
        translate_add (translate_indent & translate_var_getname_fromstack & " = 1")
        translate_add ("} else { ")
        translate_add (translate_indent & translate_var_getname_fromstack & " = 0")
        translate_add ("}")
                
    ElseIf v = "!" Then
        tmp_x = stack_pop()
        tmp_v = IIf(tmp_x(0) = "0", 1, 0)
        stack_push (tmp_v)
        translate_add ("if " & tmp_x(1) & " = 0 { ")
        translate_add (translate_indent & translate_var_getname_fromstack & " = 1")
        translate_add ("} else { ")
        translate_add (translate_indent & translate_var_getname_fromstack & " = 0")
        translate_add ("}")
    
    
    '' stack
    ElseIf v = "p" Then
        tmp_y = stack_pop()(0)
        tmp_x = stack_pop()(0)
        tmp_v = stack_pop()
        run.Cells(tmp_y + 1, tmp_x + 1).Value = Chr(tmp_v(0))
        translate_variable_setsrc tmp_x + 1, tmp_y + 1
        
        Call translate_var_getname_fromsrc(tmp_x + 1, tmp_y + 1, tmp_ta)
        translate_add (tmp_ta & " = " & tmp_v(1))
    
    ElseIf v = "g" Then
        tmp_y = stack_pop()(0)
        tmp_x = stack_pop()(0)
        tmp_v = Asc(run.Cells(tmp_y + 1, tmp_x + 1).Text)
        stack_push (tmp_v)
        Call translate_var_getname_fromsrc(tmp_x + 1, tmp_y + 1, tmp_ta)
        translate_add (translate_var_getname_fromstack & " = " & tmp_ta)
    
    ElseIf v = ":" Then
        tmp_x = stack_pop()
        stack_push (tmp_x(0))
        translate_add (translate_var_getname_fromstack & " = " & tmp_x(1))
        stack_push (tmp_x(0))
        translate_add (translate_var_getname_fromstack & " = " & tmp_x(1))
            
    '' direction
    ElseIf v = "v" Then
        direction = 2
    ElseIf v = "<" Then
        direction = 4
    ElseIf v = ">" Then
        direction = 6
    ElseIf v = "^" Then
        direction = 8
        
    ElseIf v = "_" Then
        tmp_v = stack_pop()(0)
        direction = IIf(tmp_v = "0", 6, 4)
        
    ElseIf v = "|" Then
        tmp_v = stack_pop()(0)
        direction = IIf(tmp_v = "0", 2, 8)
    
    ElseIf v = "?" Then
        direction = Int(Rnd() * 4) * 2
        
    '' skip
    ElseIf v = "#" Then
        move_next
    
    '' nop
    ElseIf v = " " Or v = "" Then
    
    Else
        Debug.Print "dont understand: " + v
    
    End If
    
    move_next
    
    step = True
End Function

Private Sub move_next()
    step_count = step_count + 1
    
    run.Cells(y_pos, x_pos).Interior.Color = &HFFFFFF

    x_pos = x_pos + IIf(direction = 6, 1, IIf(direction = 4, -1, 0))
    y_pos = y_pos + IIf(direction = 2, 1, IIf(direction = 8, -1, 0))
    If x_pos < 1 Then
        x_pos = 100
    End If
    If x_pos > 100 Then
        x_pos = 1
    End If
    
    If y_pos < 1 Then
        y_pos = 100
    End If
    If y_pos > 100 Then
        y_pos = 1
    End If
    
    run.Cells(y_pos, x_pos).Interior.Color = &H80FF
    'run.Activate
    'stack.Activate
    
    Sleep (50)
    DoEvents
    
End Sub

